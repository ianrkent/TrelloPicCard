
TrelloPicCard.addCardForImage = (function($, Trello) {

    return function(imageUrl, idList) {
        var name;

        // Default description is the URL of the page we're looking at
        var desc = location.href;

        // use page title as card title, taking trello as a "read-later" tool
        name = $.trim(document.title);

        // Get any selected text
        var selection;

        if (window.getSelection) {
            selection = "" + window.getSelection();
        } else if (document.selection && document.selection.createRange) {
            selection = document.selection.createRange().text;
        }

        // If they've selected text, add it to the name/desc of the card
        if (selection) {
            if (!name) {
                name = selection;
            } else {
                desc += "\n\n" + selection;
            }
        }

        name = name || 'Unknown page';

        // Create the card
        if (name) {

            Trello.post("lists/" + idList + "/cards", {
                name: name,
                desc: desc
            }, function(card) {

                // Display a little notification in the upper-left corner with a link to the card
                // that was just created
                var $cardLink = $("<a>")
                    .attr({
                        href: card.url,
                        target: "card"
                    })
                    .text("Created a Trello Card")
                    .css({
                        position: "fixed",
                        left: 0,
                        top: 0,
                        padding: "4px",
                        border: "1px solid #000",
                        background: "#fff",
                        "z-index": 1e3
                    })
                    .appendTo("body");

                setTimeout(function() {
                    $cardLink.fadeOut(3000);
                }, 5000);

                // Add the imageUrl as the banner 
                Trello.post("cards/" + card.id + '/attachments', {
                    url: imageUrl
                }, function(attachment) {
                    console.log(attachment);
                });
            });
        }
    };
})(jQuery, Trello);