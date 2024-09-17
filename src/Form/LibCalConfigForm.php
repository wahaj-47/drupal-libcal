<?php

namespace Drupal\libcal\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class LibCalConfigForm extends ConfigFormBase
{

  /**
   * {@inheritdoc}
   */
  public function getFormId()
  {
    return 'libcal_config_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    // Form constructor.
    $form = parent::buildForm($form, $form_state);

    // Default settings.
    $config = $this->config('libcal.settings');


    $form['#tree'] = TRUE;

    $form['host'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Host:'),
      '#default_value' => $config->get('libcal.host'),
      '#description' => $this->t('Enter your LibCal app host.'),
    ];
    $form['client_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Client ID:'),
      '#default_value' => $config->get('libcal.client_id'),
      '#description' => $this->t('Enter your LibCal app client ID.'),
    ];
    $form['client_secret'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Client Secret:'),
      '#default_value' => $config->get('libcal.client_secret'),
      '#description' => $this->t('Enter your LibCal app client secret.'),
    ];
    $form['calendar_ids'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Calendar IDs:'),
      '#default_value' => $config->get('libcal.calendar_ids'),
      '#description' => $this->t('Enter your LibCal Calendar IDs, separated by "," (commas).'),
    ];

    $form['location_mapping'] = array(
      '#type' => 'fieldset',
      '#title' => t('Location ID Mapping:'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
      '#description' => $this->t('Create a mapping between LibCal Space location and LibCal Hours location. Each comma separated Space location ID will be associated with the corresponding Hours location ID.'),
    );

    $form['location_mapping']['spaces_lids'] = array(
      '#type' => 'textfield',
      '#title' => t('Spaces LIDs:'),
      '#default_value' => $config->get('libcal.spaces_lids'),
      '#description' => $this->t('Enter location IDs defined in the LibCal Spaces module, separated by "," (commas).'),
    );

    $form['location_mapping']['hours_lids'] = array(
      '#type' => 'textfield',
      '#title' => t('Hours LIDs:'),
      '#default_value' => $config->get('libcal.hours_lids'),
      '#description' => $this->t('Enter location IDs defined in the LibCal Hours module, separated by "," (commas).'),
    );

    $category_ids = $config->get('libcal.category_ids');
    $category_ids = explode("|", $category_ids);

    $policy_statements = $config->get('libcal.policy_statements');
    $policy_statements = explode("|", $policy_statements);

    // Gather the number of names in the form already.
    $num_statements = $form_state->get('num_statements');
    // We have to ensure that there is at least one name field.
    if ($num_statements === NULL) {
      $num_policies = count($policy_statements);

      $name_field = $form_state->set('num_statements', $num_policies);
      $num_statements = $num_policies;
    }

    $form['policy_statements'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Policy statements'),
      '#prefix' => '<div id="policy_statements-wrapper">',
      '#suffix' => '</div>',
    ];

    for ($i = 0; $i < $num_statements; $i++) {
      $form['policy_statements'][$i] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Policy') . ' ' . ($i + 1),
      ];
      $form['policy_statements'][$i]['category_id'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Category ID'),
        '#default_value' => $category_ids[$i],
      ];
      $form['policy_statements'][$i]['statement'] = [
        '#type' => 'textarea',
        '#title' => $this->t('Statement'),
        '#default_value' => $policy_statements[$i],
      ];
    }

    $form['policy_statements']['actions'] = [
      '#type' => 'actions',
    ];
    $form['policy_statements']['actions']['add'] = [
      '#type' => 'submit',
      '#value' => $this->t('Add'),
      '#submit' => ['::addOne'],
      '#ajax' => [
        'callback' => '::addmoreCallback',
        'wrapper' => 'policy_statements-wrapper',
      ],
    ];
    // If there is more than one name, add the remove button.
    if ($num_statements > 0) {
      $form['policy_statements']['actions']['remove'] = [
        '#type' => 'submit',
        '#value' => $this->t('Remove'),
        '#submit' => ['::removeCallback'],
        '#ajax' => [
          'callback' => '::addmoreCallback',
          'wrapper' => 'policy_statements-wrapper',
        ],
      ];
    }


    return $form;
  }

  /**
   * Callback for both ajax-enabled buttons.
   *
   * Selects and returns the fieldset with the names in it.
   */
  public function addmoreCallback(array &$form, FormStateInterface $form_state)
  {
    return $form['policy_statements'];
  }

  /**
   * Submit handler for the "add-one-more" button.
   *
   * Increments the max counter and causes a rebuild.
   */
  public function addOne(array &$form, FormStateInterface $form_state)
  {
    $name_field = $form_state->get('num_statements');
    $add_button = $name_field + 1;
    $form_state->set('num_statements', $add_button);
    // Since our buildForm() method relies on the value of 'num_statements' to
    // generate 'name' form elements, we have to tell the form to rebuild. If we
    // don't do this, the form builder will not call buildForm().
    $form_state->setRebuild();
  }

  /**
   * Submit handler for the "remove one" button.
   *
   * Decrements the max counter and causes a form rebuild.
   */
  public function removeCallback(array &$form, FormStateInterface $form_state)
  {
    $name_field = $form_state->get('num_statements');
    if ($name_field > 0) {
      $remove_button = $name_field - 1;
      $form_state->set('num_statements', $remove_button);
    }
    // Since our buildForm() method relies on the value of 'num_statements' to
    // generate 'name' form elements, we have to tell the form to rebuild. If we
    // don't do this, the form builder will not call buildForm().
    $form_state->setRebuild();
  }

  private function isEmpty(string $value)
  {
    return empty($value);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state)
  {
    if ($this->isEmpty($form_state->getValue('host'))) {
      $form_state->setErrorByName('host', $this->t('This field is required.'));
    }
    if ($this->isEmpty($form_state->getValue('client_id'))) {
      $form_state->setErrorByName('client_id', $this->t('This field is required.'));
    }
    if ($this->isEmpty($form_state->getValue('client_secret'))) {
      $form_state->setErrorByName('client_secret', $this->t('This field is required.'));
    }

    $spaces_lids = $form_state->getValue(['location_mapping', 'spaces_lids']);
    $hours_lids = $form_state->getValue(['location_mapping', 'hours_lids']);

    $spaces_lids_list = explode(",", $spaces_lids);
    $hours_lids_list = explode(",", $hours_lids);

    if (
      (count($spaces_lids_list) != count($hours_lids_list)) ||
      ($this->isEmpty($spaces_lids) && !$this->isEmpty($hours_lids)) ||
      (!$this->isEmpty($spaces_lids) && $this->isEmpty($hours_lids))
    ) {
      $form_state->setErrorByName('spaces_lids', $this->t('The number of Spaces location IDs do not match the number of Hours location IDs'));
      $form_state->setErrorByName('hours_lids', $this->t('The number of Spaces location IDs do not match the number of Hours location IDs'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $config = $this->config('libcal.settings');
    $config->set('libcal.host', $form_state->getValue('host'));
    $config->set('libcal.client_id', $form_state->getValue('client_id'));
    $config->set('libcal.client_secret', $form_state->getValue('client_secret'));
    $config->set('libcal.calendar_ids', $form_state->getValue('calendar_ids'));
    $config->set('libcal.spaces_lids', $form_state->getValue(['location_mapping', 'spaces_lids']));
    $config->set('libcal.hours_lids', $form_state->getValue(['location_mapping', 'hours_lids']));

    $num_statements = $form_state->get('num_statements');

    $category_ids = "";
    $policy_statements = "";

    for ($i = 0; $i < $num_statements; $i++) {

      if ($i > 0) {
        $category_ids .= "|";
        $policy_statements .= "|";
      }

      $category_ids .= $form_state->getValue(['policy_statements', $i, 'category_id']);
      $policy_statements .= $form_state->getValue(['policy_statements', $i, 'statement']);
    }

    $config->set('libcal.category_ids', $category_ids);
    $config->set('libcal.policy_statements', $policy_statements);

    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames()
  {
    return [
      'libcal.settings',
    ];
  }
}
