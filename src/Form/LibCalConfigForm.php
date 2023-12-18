<?php

namespace Drupal\libcal\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class LibCalConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'libcal_config_form';
  }

   /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Form constructor.
    $form = parent::buildForm($form, $form_state);

    // Default settings.
    $config = $this->config('libcal.settings');

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

    return $form;
  }

  private function isEmpty(string $value){
    return empty($value);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    if ($this->isEmpty($form_state->getValue('host'))) {
      $form_state->setErrorByName('host', $this->t('This field is required.'));
    }
    if ($this->isEmpty($form_state->getValue('client_id'))) {
      $form_state->setErrorByName('client_id', $this->t('This field is required.'));
    }
    if ($this->isEmpty($form_state->getValue('client_secret'))) {
      $form_state->setErrorByName('client_secret', $this->t('This field is required.'));
    }

    $spaces_lids = $form_state->getValue('spaces_lids');
    $hours_lids = $form_state->getValue('hours_lids');

    $spaces_lids_list = explode(",", $spaces_lids);
    $hours_lids_list = explode(",", $hours_lids);

    if(
      (count($spaces_lids_list) != count($hours_lids_list)) || 
      ($this->isEmpty($spaces_lids) && !$this->isEmpty($hours_lids)) || 
      (!$this->isEmpty($spaces_lids) && $this->isEmpty($hours_lids))
      )
    {
      $form_state->setErrorByName('spaces_lids', $this->t('The number of Spaces location IDs do not match the number of Hours location IDs'));
      $form_state->setErrorByName('hours_lids', $this->t('The number of Spaces location IDs do not match the number of Hours location IDs'));
    }

  }

    /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('libcal.settings');
    $config->set('libcal.host', $form_state->getValue('host'));
    $config->set('libcal.client_id', $form_state->getValue('client_id'));
    $config->set('libcal.client_secret', $form_state->getValue('client_secret'));
    $config->set('libcal.calendar_ids', $form_state->getValue('calendar_ids'));
    $config->set('libcal.spaces_lids', $form_state->getValue('spaces_lids'));
    $config->set('libcal.hours_lids', $form_state->getValue('hours_lids'));
    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'libcal.settings',
    ];
  }

}

?>