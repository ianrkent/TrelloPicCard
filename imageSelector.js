
TrelloPicCard.promptImageSelection = (function($) {

    return function(imageProps, imageSelectedCallback) {
        var maxImageDimension = 300;

        var finish = function(selectedUrl) {
            $overlay.remove();
            $scrollableContainer.remove();
            if (imageSelectedCallback && selectedUrl) {
                imageSelectedCallback(selectedUrl);
            }
        }

        // Cover the existing webpage with an overlay   
        var $overlay = $("<div>")
            .css({
                background: "#000",
                opacity: .75,
                "z-index": 1e4,
                position: "fixed",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            })
            .appendTo("body")
            .click(function() {
                finish();
            });

        // add a container for the gallery of images
        var $scrollableContainer = $("<div>")
            .css({
                position: "fixed",
                padding: "16px",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: "scroll",
                "z-index": 1e5
            })
            .appendTo("body")
            .click(function() {
                finish();
            });

        // add each URL as a new image element to select
        $.each(imageProps, function(idx, imageProp) {
            console.log(imageProp);
            imageProp.fitToMax(maxImageDimension);

            $("<img>")
                .attr("src", imageProp.url)
                .css({
                    width: imageProp.width + 'px',
                    height: imageProp.height + 'px',
                    margin: '16px'
                })
                .click(function() {
                    finish(imageProp.url);
                })
                .appendTo($scrollableContainer);
        });
    }
})(jQuery);