
// A fake "prompt" to get info from the user
TrelloPicCard.overlayPrompt = (function ($) {

    return function(html, hasInput, callback) {
        var done = function(value) {
            $div.remove();
            $overlay.remove();
            callback(value);
        };

        // Cover the existing webpage with an overlay   
        var $overlay = $("<div>")
            .css({
                background: "#000",
                opacity: .75,
                "z-index": 1e4,
                position: "absolute",
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
        var $div = $("<div>")
            .css({
                position: "absolute",
                border: "1px solid #000",
                padding: "16px",
                width: 300,
                top: 64,
                left: ($(window).width() - 200) / 2,
                background: "#fff",
                "z-index": 1e5
            })
            .appendTo("body");

        // Show the prompt
        $("<div>").html(html).appendTo($div);

        // Optionally show an input
        var $input = $("<input>")
            .css({
                width: "100%",
                "margin-top": "8px"
            })
            .appendTo($div)
            .toggle(hasInput);

        // Add an "OK" button
        $("<div>")
            .text("OK")
            .css({
                width: "100%",
                "text-align": "center",
                border: "1px solid #000",
                background: "#eee",
                "margin-top": "8px",
                cursor: "pointer"
            })
            .appendTo($div)
            .click(function() {
                done($input.val());
            });

        return $div;
    };

})(jQuery);