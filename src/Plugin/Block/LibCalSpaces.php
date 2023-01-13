<?php
namespace Drupal\libcal\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'LibCalSpaces' block.
 *
 * @Block(
 *  id = "libcal_spaces",
 *  admin_label = @Translation("LibCal Spaces"),
 * )
 */
class LibCalSpaces extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['libcal_spaces'] = [
      '#markup' => '<div id="spaces"></div>',
      '#attached' => [
        'library' => ['libcal/fontawesome','libcal/spaces']
      ],
    ];
    return $build;
  }
}