<?php
namespace Drupal\libcal\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'LibCalEvents' block.
 *
 * @Block(
 *  id = "libcal_events_calendar",
 *  admin_label = @Translation("LibCal Events Calendar"),
 * )
 */
class LibCalEvents extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['libcal_events'] = [
      '#markup' => '<div id="events-calendar"></div>',
      '#attached' => [
        'library' => ['libcal/slick', 'libcal/tooltip', 'libcal/fontawesome', 'libcal/events_calendar']
      ],
    ];
    return $build;
  }
}