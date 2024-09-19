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

    // Add vertical tabs to the form.
    $form['tabs'] = [
      '#type' => 'vertical_tabs',
      '#title' => $this->t('Settings'),
    ];

    // Create a tab for Policy Statements.
    $form['api_config_tab'] = [
      '#type' => 'details',
      '#title' => $this->t('API Config'),
      '#group' => 'tabs', // This groups it under the vertical tabs.
    ];

    $form['api_config_tab']['host'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Host:'),
      '#default_value' => $config->get('libcal.host'),
      '#description' => $this->t('Enter your LibCal app host.'),
    ];
    $form['api_config_tab']['client_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Client ID:'),
      '#default_value' => $config->get('libcal.client_id'),
      '#description' => $this->t('Enter your LibCal app client ID.'),
    ];
    $form['api_config_tab']['client_secret'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Client Secret:'),
      '#default_value' => $config->get('libcal.client_secret'),
      '#description' => $this->t('Enter your LibCal app client secret.'),
    ];
    $form['api_config_tab']['calendar_ids'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Calendar IDs:'),
      '#default_value' => $config->get('libcal.calendar_ids'),
      '#description' => $this->t('Enter your LibCal Calendar IDs, separated by "," (commas).'),
    ];

    // Create a tab for Policy Statements.
    $form['policy_statement_tab'] = [
      '#type' => 'details',
      '#title' => $this->t('Policy Statements'),
      '#group' => 'tabs', // This groups it under the vertical tabs.
    ];

    $policy_statements = $config->get('libcal.policy_statement') ?? [];
    $policy_statement_count = $form_state->get('policy_statement_count');
    if ($policy_statement_count === NULL) {
      $num_statements = count($policy_statements);
      $form_state->set('policy_statement_count', $num_statements);
    }

    $this->addMultipleTextField(
      $form['policy_statement_tab'],
      'policy_statement_tab',
      $form_state,
      'policy_statement',
      [
        'category_id' => [
          '#type' => 'textfield',
          '#title' => $this->t('Category ID'),
        ],
        'statement' => [
          '#type' => 'textarea',
          '#title' => $this->t('Statement'),
        ]
      ],
      $policy_statements
    );

    // Create a tab for Policy Statements.
    $form['custom_footer_tab'] = [
      '#type' => 'details',
      '#title' => $this->t('Custom Footers'),
      '#group' => 'tabs', // This groups it under the vertical tabs.
    ];

    $global_footer = $config->get('libcal.global_footer') ?? [];
    $form['custom_footer_tab']['global_footer']['markup'] = [
      '#type' => 'text_format',
      '#title' => t('Global Footer'),
      '#description' => t("This footer appears below every space description"),
      '#format' => 'full_html',
      '#default_value' => $global_footer['markup']['value']
    ];

    $custom_footers = $config->get('libcal.custom_footer') ?? [];
    $custom_footer_count = $form_state->get('custom_footer_count');
    if ($custom_footer_count === NULL) {
      $num_footers = count($custom_footers);
      $form_state->set('custom_footer_count', $num_footers);
    }

    $id_options = $this->fetchSpaceOptions();

    $this->addMultipleTextField(
      $form['custom_footer_tab'],
      'custom_footer_tab',
      $form_state,
      'custom_footer',
      [
        'id' => [
          '#type' => 'select',
          '#multiple' => true,
          '#title' => $this->t('Spaces'),
          '#options' => $id_options,
          '#attributes' => ['class' => ['chosen-select'], 'data-placeholder' => $this->t('Select spaces that will share this footer')],
          '#attached' => [
            'library' => ['libcal/chosen'],
          ],
        ],
        'markup' => [
          '#type' => 'text_format',
          '#title' => $this->t('Markup'),
          '#format' => 'full_html',
        ]
      ],
      $custom_footers
    );

    return $form;
  }

  /**
   * Add textfield with add more button.
   *
   * @param array $form
   *   Form concern.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Form state object.
   * @param string $field
   *   Field name.
   */
  protected function addMultipleTextField(array &$form, string $tab, FormStateInterface &$form_state, string $field, array $fields, array $values): void
  {
    $counter = $field . '_count';
    $counterValue = $form_state->get($counter) ?? 0;
    $form_state->set($counter, $counterValue);

    $wrapperId = $field . '_wrapper';
    $fieldset = $field . '_fieldset';
    $form['#tree'] = TRUE;
    $form[$fieldset] = [
      '#type' => 'container',
      '#prefix' => '<div id="' . $wrapperId . '">',
      '#suffix' => '</div>',
    ];

    for ($i = 0; $i < $counterValue; $i++) {
      $form[$fieldset][$field][$i] = [
        '#type' => 'fieldset',
        '#title' => $this->t(ucwords(str_replace("_", " ", $field))) . ' ' . ($i + 1),
      ];

      foreach ($fields as $key => $config) {
        $form[$fieldset][$field][$i][$key] = $config;
        if ($form[$fieldset][$field][$i][$key]['#type'] == 'text_format') {
          $form[$fieldset][$field][$i][$key]['#default_value'] = $values[$i][$key]['value'] ?? '';
        } else {
          $form[$fieldset][$field][$i][$key]['#default_value'] = $values[$i][$key] ?? '';
        }
      }
    }

    $form[$fieldset]['actions'] = [
      '#type' => 'actions',
    ];
    $form[$fieldset]['actions']['add_name'] = [
      '#type' => 'submit',
      '#value' => $this->t('Add ' . $this->t(ucwords(str_replace("_", " ", $field)))),
      '#name' => 'add-' . $wrapperId,
      '#submit' => [[$this, 'addOne']],
      '#ajax' => [
        'callback' => [$this, 'addMoreCallback'],
        'wrapper' => $wrapperId,
        'target' => $fieldset,
        'counter' => $counter,
        'tab' => $tab,
      ],
    ];
    // If there is more than one name, add the remove button.
    if ($counterValue > 0) {
      $form[$fieldset]['actions']['remove_name'] = [
        '#type' => 'submit',
        '#value' => $this->t('Remove one'),
        '#name' => 'remove-' . $wrapperId,
        '#submit' => [[$this, 'removeCallback']],
        '#ajax' => [
          'callback' => [$this, 'addMoreCallback'],
          'wrapper' => $wrapperId,
          'target' => $fieldset,
          'counter' => $counter,
          'tab' => $tab
        ],
      ];
    }
  }

  /**
   * Fetch options for the select field from the endpoint.
   *
   * @return array
   *   An associative array of options where keys are option values and values are option labels.
   */
  protected function fetchSpaceOptions()
  {
    $options = [];

    // Make an HTTP request to the endpoint.
    $response = \Drupal::httpClient()->get('https://libstage.lsu.edu/api/libcal/space/items/16786?pageSize=100');

    if ($response->getStatusCode() == 200) {
      $data = json_decode($response->getBody(), TRUE);
      $data = $data['message'];

      // Process the data to create options array.
      foreach ($data as $item) {
        // Assuming 'id' and 'name' are the fields in the response.
        $options[$item['id']] = $item['name'];
      }
    }

    return $options;
  }

  /**
   * Callback for both ajax-enabled buttons.
   *
   * Selects and returns the fieldset with the names in it.
   */
  public function addMoreCallback(array &$form, FormStateInterface $form_state)
  {
    $triggerElement = $form_state->getTriggeringElement();
    $tab = $triggerElement['#ajax']['tab'];
    $targetElement = $triggerElement['#ajax']['target'];
    if (empty($tab) || empty($targetElement)) {
      return [];
    }
    return $form[$tab][$targetElement] ?? [];
  }

  /**
   * Submit handler for the "add-one-more" button.
   *
   * Increments the max counter and causes a rebuild.
   */
  public function addOne(array &$form, FormStateInterface $form_state)
  {
    $triggerElement = $form_state->getTriggeringElement();
    if (empty($counter = $triggerElement['#ajax']['counter'])) {
      return;
    }
    $counterValue = $form_state->get($counter);
    $form_state->set($counter, $counterValue + 1);
    $form_state->setRebuild();
  }

  /**
   * Submit handler for the "remove one" button.
   *
   * Decrements the max counter and causes a form rebuild.
   */
  public function removeCallback(array &$form, FormStateInterface $form_state)
  {
    $triggerElement = $form_state->getTriggeringElement();
    if (empty($counter = $triggerElement['#ajax']['counter'])) {
      return;
    }
    $counterValue = $form_state->get($counter);
    if ($counterValue > 0) {
      $form_state->set($counter, $counterValue - 1);
    }
    $form_state->setRebuild();
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {}

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $config = $this->config('libcal.settings');
    $config->set('libcal.host', $form_state->getValue(['api_config_tab', 'host']));
    $config->set('libcal.client_id', $form_state->getValue(['api_config_tab', 'client_id']));
    $config->set('libcal.client_secret', $form_state->getValue(['api_config_tab', 'client_secret']));
    $config->set('libcal.calendar_ids', $form_state->getValue(['api_config_tab', 'calendar_ids']));
    $config->set('libcal.global_footer', $form_state->getValue(['custom_footer_tab', 'global_footer']));

    // Get the values from the form.
    foreach (['policy_statement', 'custom_footer'] as $field) {
      $values = $form_state->getValue([$field . '_tab', $field . '_fieldset']);

      $data = [];
      if (isset($values[$field])) {
        foreach ($values[$field] as $item) {
          $data[] = $item;
        }
      }

      // Save the data to the configuration.
      $config->set('libcal.' . $field, $data);
    }

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
