<?php

namespace Drupal\libcal\Plugin\rest\resource;

use Drupal\Component\Plugin\DependentPluginInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Routing\BcRoute;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use GuzzleHttp\Exception\RequestException;

/**
 * Represents LibCal Calendar records as resources.
 *
 * @RestResource (
 *   id = "libcal",
 *   label = @Translation("LibCal"),
 *   uri_paths = {
 *     "canonical" = "/api/libcal/{resource}/{sub_resource}/{sub_sub_resource}/{sub_sub_sub_resource}",
 *     "create" = "/api/libcal/{resource}/{sub_resource}/{sub_sub_resource}/{sub_sub_sub_resource}"
 *   }
 * )
 *
 * @DCG
 * This plugin acts as a intermidiary between drupal and LibCal REST api. In order to enable it
 * import the resource configuration into active configuration storage. You may
 * find an example of such configuration in the following file:
 * core/modules/rest/config/optional/rest.resource.entity.node.yml.
 * Alternatively you can make use of REST UI module.
 * @see https://www.drupal.org/project/restui
 * For accessing Drupal entities through REST interface use
 * \Drupal\rest\Plugin\rest\resource\EntityResource plugin.
 */
class LibCal extends ResourceBase {

  private function getQueryParams($params){
    $args = "?";

    foreach ($params as $key => $value) {
      $args = $args.$key."=".$value."&";
    }
    $args = substr($args, 0, -1);

    return $args;
  }

  private function constructEndpoint($resource, $sub_resource, $sub_sub_resource, $sub_sub_sub_resource){
    $endpoint = $resource;

    if($sub_resource){
      $endpoint = $endpoint."/".$sub_resource;
      if($sub_sub_resource){
        $endpoint = $endpoint."/".$sub_sub_resource;
        if($sub_sub_sub_resource){
          $endpoint = $endpoint."/".$sub_sub_sub_resource;
        }
      }
    }

    return $endpoint;
  }

  private function postAccessToken()
    {
      try {
        $config = \Drupal::config('libcal.settings');
        $response = \Drupal::httpClient()->post($config->get('libcal.host')."/1.1/oauth/token", [
            'json' => [
                'client_id' => $config->get("libcal.client_id"),
                'client_secret' => $config->get("libcal.client_secret"),
                'grant_type' => "client_credentials",
            ]
        ]);
        return json_decode((string)$response->getBody());
      } catch (RequestException $e) {
        print_r($e->getMessage());
        return null;
      }
    }

  /**
   * Responds to GET requests.
   */
  public function get($resource, $sub_resource, $sub_sub_resource, $sub_sub_sub_resource) {
    try {
      $config = \Drupal::config('libcal.settings');
      $access_token = $this->postAccessToken()->access_token;

      $params = \Drupal::request()->query->all();
      $args = $this->getQueryParams($params);
      $endpoint = $this->constructEndpoint($resource, $sub_resource, $sub_sub_resource, $sub_sub_sub_resource);
    
      switch ($resource) {
        case 'statements':
          $category_ids = $config->get('libcal.category_ids');
          $policy_statements = $config->get('libcal.policy_statements');
          
          $category_ids = explode("|", $category_ids);
          $policy_statements = explode("|", $policy_statements);

          $response = [];

          foreach ($category_ids as $key=>$id) {
            $response[$id] = $policy_statements[$key];
          }

          $res = ['message' => $response];
          return new ModifiedResourceResponse($res);

        case 'convert':
          $spaces_lids = $config->get('libcal.spaces_lids');
          $hours_lids = $config->get('libcal.hours_lids');

          $spaces_lids_list = explode(",", $spaces_lids);
          $hours_lids_list = explode(",", $hours_lids);

          $query_lids = $params["lids"];
          $query_lids_list = explode(",", $query_lids);

          $converted_lids = "";

          foreach ($query_lids_list as $lid) {
            $index = array_search($lid, $spaces_lids_list);
            $converted_lids = $converted_lids.$hours_lids_list[$index].",";
          }

          $converted_lids = substr($converted_lids, 0, -1);

          $res = ['message' => $converted_lids];
          return (new ModifiedResourceResponse($res))->setMaxAge(0);
        
        case 'calendars':
          $response = \Drupal::httpClient()->get($config->get('libcal.host')."/1.1/".$resource."/".$config->get('libcal.calendar_ids').$args, [
            'headers' => [
                'Authorization' => 'Bearer '.$access_token
            ]
          ]);
          break;
        
        default:
          $response = \Drupal::httpClient()->get($config->get('libcal.host')."/1.1/".$endpoint.$args, [
              'headers' => [
                  'Authorization' => 'Bearer '.$access_token
              ]
          ]);
          break;
      }

      $res = ['message' => json_decode((string)$response->getBody(), true)];
      return (new ModifiedResourceResponse($res))->setMaxAge(0);

    } catch (RequestException $e) {

      $error = $e->getResponse();

      if($error){
        $error_message = ['message' => json_decode($error->getBody(), true)];
        $status_code = $error->getStatusCode();
      }

      return (new ModifiedResourceResponse($error_message, $status_code))->setMaxAge(0);
    }
  }

  /**
   * Responds to POST requests.
   */
  public function post($resource, $sub_resource, $sub_sub_resource, $sub_sub_sub_resource, $data) {
    try {
      $config = \Drupal::config('libcal.settings');
      $access_token = $this->postAccessToken()->access_token;

      $endpoint = $this->constructEndpoint($resource, $sub_resource, $sub_sub_resource, $sub_sub_sub_resource);

      $response = \Drupal::httpClient()->post($config->get('libcal.host')."/1.1/".$endpoint, [
          'headers' => [
              'Authorization' => 'Bearer '.$access_token
          ],
          'json' => $data
      ]);

      $res = ['message' => json_decode((string)$response->getBody(), true)];
      return (new ModifiedResourceResponse($res))->setMaxAge(0);

    } catch (RequestException $e) {

      $error = $e->getResponse();

      if($error){
        // Get the response body as a string
        $response_body = (string) $error->getBody();

        // Attempt to decode the response body as JSON
        $decoded_response = json_decode($response_body, true);

        if ($decoded_response !== null) {
          // If the response body is valid JSON, extract the error message
          $error_message = ['message' => $decoded_response['error_message']]; // Adjust the key based on your API's response structure
        } else {
          // If the response body is not valid JSON, use it as the error message
          $error_message = ['message' => $response_body];
        }

        $status_code = $error->getStatusCode();
        return (new ModifiedResourceResponse($error_message, $status_code))->setMaxAge(0);
      }

      return (new ModifiedResourceResponse(['message' => 'Unknown error'], 500))->setMaxAge(0);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function routes() {
    $collection = parent::routes();
    // Add defaults for optional parameters.
    $defaults = [
      'resource' => NULL,
      'sub_resource' => NULL,
      'sub_sub_resource' => NULL,
      'sub_sub_sub_resource' => NULL,
    ];
    foreach ($collection->all() as $route) {
      $route->addDefaults($defaults);
    }
    return $collection;
  }

}
