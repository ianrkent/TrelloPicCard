
TrelloPicCard.promptImageSelection = (function($) {

    var normalisImgSrcUrl = function (url) {
        var el = document.createElement('a');
        el.href = url;
        return el.href;
    };

    var getImagesData = function () {
        var imagesData = [];

        $("img").each(function (i, image) {
            var img = $(image);

            var imgProps = {
                url: normalisImgSrcUrl(img.attr('src')),
                width: img.width(),
                height: img.height(),
                fitToMax: function (max) {
                    var maxDimension = this.height >= this.width
                        ? { dimType: 'height', dim: this.height }
                        : { dimType: 'width', dim: this.width };

                    if (max >= maxDimension.dim)
                        return { width: this.width, height: this.height };

                    if (maxDimension.dimType === 'height') {
                        return { width: this.width * max / this.height, height: max };
                    }

                    return { width: max, height: this.height * max / this.width };
                }
            };

            // look to add all elements that have a background image, but this is expensive!

            imagesData.push(imgProps);
        });

        return imagesData;
    };

    return function(imageSelectedCallback) {
        var maxImageDimension = 300;
        
        var finish = function(imageData) {
            $overlay.remove();
            $scrollableContainer.remove();
            if (imageSelectedCallback && imageData) {
                imageSelectedCallback(imageData);
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

        // get info about all the images on the page
        var imagesData = getImagesData();

        // add each URL as a new image element to select
        $.each(imagesData, function (idx, imageData) {
            var containedSize = imageData.fitToMax(maxImageDimension);

            $("<img>")
                .attr("src", imageData.url)
                .css({
                    width: containedSize.width + 'px',
                    height: containedSize.height + 'px',
                    margin: '16px'
                })
                .click(function() {
                    finish(imageData);
                })
                .appendTo($scrollableContainer);
        });
    }
})(jQuery);