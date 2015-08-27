
TrelloPicCard.promptImageSelection = (function($) {

    var ImageProps = function(url, width, height) {
        this.url = url;
        this.width = width;
        this.height = height;
    };

    ImageProps.prototype.fitToMax = function(max) {
        var maxDimension = this.height >= this.width
            ? { dimType: 'height', dim: this.height }
            : { dimType: 'width', dim: this.width };

        if (max >= maxDimension.dim)
            return { width: this.width, height: this.height };

        if (maxDimension.dimType === 'height') {
            return { width: this.width * max / this.height, height: max };
        }

        return { width: max, height: this.height * max / this.width };
    };

    var normalisImgSrcUrl = function (url) {
        if (url.substring(0, 3) === 'url') {
            url = url.substring(4, url.length - 1);  // handle browsers that return url(http://sdfsdf/etc) from the background-image CSS property
        }
        var el = document.createElement('a');
        el.href = url;
        var result = el.href;
        return result;
    };

    var getImagesData = function () {
        var imagesData = [];

        $("img").each(function (i, image) {
            var img = $(image);
            var imgProps = new ImageProps(normalisImgSrcUrl(img.attr('src')), img.width(), img.height());
            imagesData.push(imgProps);
        });

        // look to add all elements that have a background image, but this is expensive!
        var elementsWithBackgroundImages = $('div, a, span, p').filter(function () {
            var bgImageStyle = $(this).css('background-image');
            return bgImageStyle !== '' && bgImageStyle !== 'none';
        });

        elementsWithBackgroundImages.each(function (i, element) {
            var $element = $(element);
            var bgImageUrl = $element.css('background-image');
            var imgProps = new ImageProps(normalisImgSrcUrl(bgImageUrl), $element.width(), $element.height());
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