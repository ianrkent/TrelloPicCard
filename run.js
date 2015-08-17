
TrelloPicCard.run = (function ($) {

    var normalisImgSrcUrl = function (url) {
        console.log(url);
        var el = document.createElement('a');
        el.href = url;
        return el.href;
    };

    return function(listIdToAddTo) {
        var imageUrls = [];

        $("img").each(function(i, image) {
            var img = $(image);

            var imgProps = {
                url: normalisImgSrcUrl(img.attr('src')),
                width: img.width(),
                height: img.height(),
                fitToMax: function(max) {
                    var maxDimension = this.height >= this.width
                        ? { dimType: 'height', dim: this.height }
                        : { dimType: 'width', dim: this.width };

                    if (max >= maxDimension.dim)
                        return;

                    if (maxDimension.dimType === 'height') {
                        this.width = this.width * max / this.height;
                        this.height = max;
                    }

                    this.height = this.height * max / this.width;
                    this.width = max;
                }
            };

            imageUrls.push(imgProps);
        });

        // look to add all elements that have a background image, but this is expensive!

        TrelloPicCard.promptImageSelection(imageUrls, function(url) {
            TrelloPicCard.addCardForImage(url, listIdToAddTo);
        });
    }
})(jQuery);