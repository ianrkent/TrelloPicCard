

TrelloPicCard.ControlCentre =  (function ($) {
    var $controlCentre;
    var model = {};

    var displayControlCentre = function(visible) {
        if (visible) {
            $controlCentre.show(300);

        } else {
            $controlCentre.hide(300);
        }
    }

    var init = function () {
        $controlCentre = $('div.trellopic-control-centre');

        if (!$controlCentre.length) {
            $controlCentre = $('<div class="trellopic-control-centre"/>')
                .hide()
                .appendTo($('body'));

            $controlCentre.load(TrelloPicCard.appRoot + 'html/controlCentre.html', function() {
                initEvents();
            });
        }
    }

    var initEvents = function() {
        $controlCentre.find(".trellopic-id-create-card").on('click', function() {
            TrelloPicCard.addCardForImage(model.imageData.url, TrelloPicCard.selectedList().listId, $controlCentre.find('.trellopic-id-card-title').val());
            displayControlCentre(false);
        });

        $controlCentre.find(".trellopic-id-selected-list").on('click', function () {
            displayControlCentre(false);
            TrelloPicCard.listSelector(function () {
                setSelectedList();
                displayControlCentre(true);
            });
        });

        $controlCentre.find(".trellopic-id-image-preview").on('click', function () {
            displayControlCentre(false);
            TrelloPicCard.promptImageSelection(function (imageData) {
                if (imageData) {
                    setImage(imageData);
                    displayControlCentre(true);
                }
            });
        });

        $controlCentre.find(".trellopic-id-close").on('click', function () {
            displayControlCentre(false);
        });
    }

    var setSelectedList = function () {
        $controlCentre.find(".trellopic-id-selected-list").text(TrelloPicCard.selectedList().listDisplayName);
    }

    var setImage = function (imageData) {
        model.imageData = imageData;

        var containedSize = imageData.fitToMax(175);

        var previewContainer = $controlCentre.find('.trellopic-id-image-preview');

        var $imgPreview = $('<img>')
            .attr("src", imageData.url)
            .css({
                width: containedSize.width + 'px',
                height: containedSize.height + 'px'
            });
        
        previewContainer.empty().append($imgPreview);
    }

    var setCardName = function (cardTitle) {
        $controlCentre.find('.trellopic-id-card-title').val(cardTitle);
    };

    init();

    return {
        show: function (imageData) {
            setImage(imageData);
            setSelectedList();
            setCardName($.trim(document.title));
            displayControlCentre(true);
        }
    }

})(jQuery);