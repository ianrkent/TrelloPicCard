
TrelloPicCard.run = (function ($) {

    return function(defaultListIdToAddTo) {

        // prompt for image selection
        TrelloPicCard.promptImageSelection(function(imageData) {
            TrelloPicCard.ControlCentre.show(imageData, defaultListIdToAddTo);
        });
    };

})(jQuery);