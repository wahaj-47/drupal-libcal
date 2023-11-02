<?php
namespace Drupal\libcal\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'LibCalReserveSpace' block.
 *
 * @Block(
 *  id = "libcal_reserve_space",
 *  admin_label = @Translation("LibCal Space Reservation"),
 * )
 */
class LibCalReserveSpace extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['libcal_reserve_space'] = [
      '#markup' => '<div id="reserve-space"></div>',
      '#attached' => [
        'library' => ['libcal/slick', 'libcal/tooltip', 'libcal/reserve_space']
      ],
    ];
    return $build;
  }
}