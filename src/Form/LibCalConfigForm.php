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

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {

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