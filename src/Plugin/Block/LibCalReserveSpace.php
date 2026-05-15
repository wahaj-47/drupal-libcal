<?php

namespace Drupal\libcal\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'LibCalReserveSpace' block.
 *
 * @Block(
 *   id = "libcal_reserve_space",
 *   admin_label = @Translation("LibCal Space Reservation"),
 * )
 */
class LibCalReserveSpace extends BlockBase
{

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration()
  {
    return [
      'closing_buffer_minutes' => "",
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state)
  {

    $form['closing_buffer_minutes'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Closing buffer minutes'),
      '#description' => $this->t(
        'Enter one mapping per line in the format: category_id|minutes<br>Example:<br>46675|60<br>46676|120'
      ),
      '#default_value' => $this->configuration['closing_buffer_minutes'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state)
  {
    $this->configuration['closing_buffer_minutes'] =
      $form_state->getValue('closing_buffer_minutes');
  }

  /**
   * Parse category => minutes mappings.
   */
  protected function getClosingBufferMinutes()
  {
    $lines = preg_split(
      '/\r\n|\r|\n/',
      $this->configuration['closing_buffer_minutes']
    );

    $mapping = [];

    foreach ($lines as $line) {
      $line = trim($line);

      if (!$line || !str_contains($line, '|')) {
        continue;
      }

      [$category_id, $minutes] = array_map(
        'trim',
        explode('|', $line, 2)
      );

      if (
        is_numeric($category_id) &&
        is_numeric($minutes)
      ) {
        $mapping[$category_id] = (int) $minutes;
      }
    }

    return $mapping;
  }

  /**
   * {@inheritdoc}
   */
  public function build()
  {

    return [
      '#markup' => '<div id="reserve-space"></div>',
      '#attached' => [
        'library' => [
          'libcal/slick',
          'libcal/tooltip',
          'libcal/reserve_space',
        ],
        'drupalSettings' => [
          'libcal' => [
            'closingBufferMinutes' => $this->getClosingBufferMinutes(),
          ],
        ],
      ],
    ];
  }
}
