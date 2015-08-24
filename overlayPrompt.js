
// A fake "prompt" to get info from the user
TrelloPicCard.overlayPrompt = (function ($) {
    var html, hasInput, callback, verticalStretch;
    return function (options) {

        var done = function(value) {
            $popupDiv.remove();
            $overlay.remove();
            options.callback(value);
        };

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
                done(null);
            });

        // Show a "popup"
        var $popupDiv = $("<div class='trellopic-popup'>")
            .css({
                left: ($(window).width() - 200) / 2,
            })
            .css(options.verticalStretch ? { bottom: "15px" } : { })
            .appendTo("body");

        // Show prompt/content supplied by the caller, and stretch it if necessary
        var $userContentContainer = $("<div>").html(options.html);
        if (options.verticalStretch) {
            $userContentContainer.addClass("trellopic-stretch");
            $userContentContainer.css({
                left: ($(window).width() - 200) / 2
            });
        }
        $userContentContainer.appendTo($popupDiv);

        // Optionally show an input
        var $input = $("<input>")
            .css({
                width: "100%",
                "margin-top": "8px"
            })
            .appendTo($popupDiv)
            .toggle(options.hasInput);

        // Add an "OK" button
        $("<div>")
            .text("OK")
            .addClass(options.verticalStretch ? "trellopic-button trellopic-button-stuckbottom" : "trellopic-button")
            .css({
                'margin-top': '10px'
            })
            .appendTo($popupDiv)
            .click(function() {
                done($input.val());
            });

        return $popupDiv;
    };

})(jQuery);