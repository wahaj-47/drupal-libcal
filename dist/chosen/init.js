(function ($, Drupal) {
    Drupal.behaviors.jointjsFormatter = {
        attach: function (context, settings) {
            once('chosen-select', '.chosen-select', context).forEach(function (element) {
                $(element).chosen({ width: "100%" });
            })
        }
    }
})(jQuery, Drupal);