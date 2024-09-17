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

    // $policy_settings = $config->get('libcal.policy_statements');

    // // Get and process category_ids
    // $category_ids = isset($policy_settings['category_ids']) ? $policy_settings['category_ids'] : '';
    // $category_ids = explode("|", $category_ids);

    // // Get and process policy statements
    // $policy_statements = isset($policy_settings['statements']) ? $policy_settings['statements'] : '';
    // $policy_statements = explode("|", $policy_statements);

    // // Gather the number of names in the form already.
    // $num_statements = $form_state->get('num_statements');
    // // We have to ensure that there is at least one name field.
    // if ($num_statements === NULL) {
    //   $num_policies = count($policy_statements);

    //   $name_field = $form_state->set('num_statements', $num_policies);
    //   $num_statements = $num_policies;
    // }

    // $form['policy_statements'] = [
    //   '#type' => 'fieldset',
    //   '#title' => $this->t('Policy statements'),
    //   '#prefix' => '<div id="policy_statements-wrapper">',
    //   '#suffix' => '</div>',
    // ];

    // for ($i = 0; $i < $num_statements; $i++) {
    //   $form['policy_statements'][$i] = [
    //     '#type' => 'fieldset',
    //     '#title' => $this->t('Policy') . ' ' . ($i + 1),
    //   ];
    //   $form['policy_statements'][$i]['category_id'] = [
    //     '#type' => 'textfield',
    //     '#title' => $this->t('Category ID'),
    //     '#default_value' => $category_ids[$i],
    //   ];
    //   $form['policy_statements'][$i]['statement'] = [
    //     '#type' => 'textarea',
    //     '#title' => $this->t('Statement'),
    //     '#default_value' => $policy_statements[$i],
    //   ];
    // }

    // $form['policy_statements']['actions'] = [
    //   '#type' => 'actions',
    // ];
    // $form['policy_statements']['actions']['add'] = [
    //   '#type' => 'submit',
    //   '#value' => $this->t('Add'),
    //   '#submit' => ['::addOne'],
    //   '#ajax' => [
    //     'callback' => '::updateCallback',
    //     'wrapper' => 'policy_statements-wrapper',
    //     'section' => 'policy_statements',
    //     'counter' => 'num_statements'
    //   ],
    // ];
    // // If there is more than one name, add the remove button.
    // if ($num_statements > 0) {
    //   $form['policy_statements']['actions']['remove'] = [
    //     '#type' => 'submit',
    //     '#value' => $this->t('Remove'),
    //     '#submit' => ['::removeCallback'],
    //     '#ajax' => [
    //       'callback' => '::updateCallback',
    //       'wrapper' => 'policy_statements-wrapper',
    //       'section' => 'policy_statements',
    //       'counter' => 'num_statements'
    //     ],
    //   ];
    // }

    // $footer_settings = $config->get('libcal.footers') ?? [];

    // // Get the number of footers. Initialize if not set.
    // $num_footers = $form_state->get('num_footers');
    // if ($num_footers === NULL) {
    //   $num_footers = count($footer_settings);
    //   $form_state->set('num_footers', $num_footers);
    // }

    // // Build the form fieldset.
    // $form['footers'] = [
    //   '#type' => 'fieldset',
    //   '#title' => $this->t('Custom Footers'),
    //   '#prefix' => '<div id="footers-wrapper">',
    //   '#suffix' => '</div>',
    // ];

    // // Loop to build form fields based on the number of footers.
    // for ($i = 0; $i < $num_footers; $i++) {
    //   $form['footers'][$i] = [
    //     '#type' => 'fieldset',
    //     '#title' => $this->t('Footer') . ' ' . ($i + 1),
    //   ];
    //   $form['footers'][$i]['category_id'] = [
    //     '#type' => 'textfield',
    //     '#title' => $this->t('Category ID'),
    //     '#default_value' => $footer_settings[$i]['category_id'] ?? '',
    //   ];
    //   $form['footers'][$i]['statement'] = [
    //     '#type' => 'textarea',
    //     '#title' => $this->t('Statement'),
    //     '#default_value' => $footer_settings[$i]['statement'] ?? '',
    //   ];
    // }

    // // Actions: Add and Remove buttons.
    // $form['footers']['actions'] = [
    //   '#type' => 'actions',
    // ];
    // $form['footers']['actions']['add'] = [
    //   '#type' => 'submit',
    //   '#value' => $this->t('Add'),
    //   '#submit' => ['::addOne'],
    //   '#ajax' => [
    //     'callback' => '::updateCallback',
    //     'wrapper' => 'footers-wrapper',
    //     'section' => 'footers',
    //     'counter' => 'num_footers',
    //   ],
    // ];
    // // Add remove button only if there is more than one footer.
    // if ($num_footers > 0) {
    //   $form['footers']['actions']['remove'] = [
    //     '#type' => 'submit',
    //     '#value' => $this->t('Remove'),
    //     '#submit' => ['::removeCallback'],
    //     '#ajax' => [
    //       'callback' => '::updateCallback',
    //       'wrapper' => 'footers-wrapper',
    //       'section' => 'footers',
    //       'counter' => 'num_footers',
    //     ],
    //   ];
    // }

    $policy_statements = $config->get('libcal.policy_statement') ?? [];
    $policy_statement_count = $form_state->get('policy_statement_count');
    if ($policy_statement_count === NULL) {
      $num_footers = count($policy_statements);
      $form_state->set('policy_statement_count', $num_footers);
    }

    $this->addMultipleTextField(
      $form,
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

    $footers = $config->get('libcal.custom_footer') ?? [];
    $form_state->set('custom_footer_count', count($footers));

    $this->addMultipleTextField(
      $form,
      $form_state,
      'custom_footer',
      [
        'category_id' => [
          '#type' => 'textfield',
          '#title' => $this->t('Category ID'),
        ],
        'markup' => [
          '#type' => 'text_format',
          '#title' => $this->t('Markup'),
          '#format' => 'full_html',
        ]
      ],
      $footers
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
  protected function addMultipleTextField(array &$form, FormStateInterface &$form_state, string $field, array $fields, array $values): void
  {
    $counter = $field . '_count';
    $counterValue = $form_state->get($counter) ?? 0;
    $form_state->set($counter, $counterValue);

    $wrapperId = $field . '_wrapper';
    $fieldset = $field . '_fieldset';
    $form['#tree'] = TRUE;
    $form[$fieldset] = [
      '#type' => 'fieldset',
      '#title' => $this->t(ucwords(str_replace("_", " ", $field)) . 's'),
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
        $form[$fieldset][$field][$i][$key]['#default_value'] = $values[$i][$key] ?? '';
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
        ],
      ];
    }
  }

  /**
   * Callback for both ajax-enabled buttons.
   *
   * Selects and returns the fieldset with the names in it.
   */
  public function addMoreCallback(array &$form, FormStateInterface $form_state)
  {
    $triggerElement = $form_state->getTriggeringElement();
    if (empty($targetElement = $triggerElement['#ajax']['target'])) {
      return [];
    }
    return $form[$targetElement] ?? [];
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

    // Get the values from the form.
    foreach (['policy_statement', 'custom_footer'] as $field) {
      $values = $form_state->getValue($field . '_fieldset');

      $data = [];
      if (isset($values[$field])) {
        foreach ($values[$field] as $item) {
          $data[] = [
            'category_id' => $item['category_id'] ?? '',
            'statement' => $item['statement'] ?? '',
          ];
        }
      }

      // Save the data to the configuration.
      $config->set('libcal.' . $field, $data);
    }

    // $num_statements = $form_state->get('num_statements');

    // $category_ids = [];
    // $policy_statements = [];

    // // Collect values for each statement
    // for ($i = 0; $i < $num_statements; $i++) {
    //   $category_ids[] = $form_state->getValue(['policy_statements', $i, 'category_id']);
    //   $policy_statements[] = $form_state->getValue(['policy_statements', $i, 'statement']);
    // }

    // // Prepare the mapping array for the config
    // $policy_settings = [
    //   'category_ids' => implode("|", $category_ids),
    //   'statements' => implode("|", $policy_statements),
    // ];

    // // Set the updated policy_settings array back into the config
    // $config->set('libcal.policy_statements', $policy_settings);

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
