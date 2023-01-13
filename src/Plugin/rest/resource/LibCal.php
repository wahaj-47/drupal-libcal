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

      $build = array(
        '#cache' => array(
          'max-age' => 0,
        ),
      );
      
      $res = ['message' => json_decode((string)$response->getBody(), true)];
      return (new ModifiedResourceResponse($res));
    } catch (RequestException $e) {
      $build = array(
        '#cache' => array(
          'max-age' => 0,
        ),
      );

      $res = ['message' => json_decode($e->getResponse()->getBody(), true)];
      return (new ModifiedResourceResponse($res));
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

      $build = array(
        '#cache' => array(
          'max-age' => 0,
        ),
      );
      
      $res = ['message' => json_decode((string)$response->getBody(), true)];
      return (new ModifiedResourceResponse($res));
    } catch (RequestException $e) {

      $build = array(
        '#cache' => array(
          'max-age' => 0,
        ),
      );

      $res = ['message' => json_decode($e->getResponse()->getBody(), true)];
      return (new ModifiedResourceResponse($res));
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
