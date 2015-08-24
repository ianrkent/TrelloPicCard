
TrelloPicCard.addCardForImage = (function($, Trello) {

    return function(imageUrl, listId, cardName) {

        // Default description is the URL of the page we're looking at
        var cardDescription = location.href;

        // use page title, as card name if none is supplied
        cardName = cardName || $.trim(document.title);

        // Get any selected text
        var selection;

        if (window.getSelection) {
            selection = "" + window.getSelection();
        } else if (document.selection && document.selection.createRange) {
            selection = document.selection.createRange().text;
        }

        // If they've selected text, add it to the name/desc of the card
        if (selection) {
            if (!cardName) {
                cardName = selection;
            } else {
                cardDescription += "\n\n" + selection;
            }
        }

        cardName = cardName || 'Unknown page';

        // Create the card
        Trello.post("lists/" + listId + "/cards", {
            name: cardName,
            desc: cardDescription
        }, function(card) {

            // Display a little notification in the upper-left corner with a link to the card
            // that was just created
            var $cardLink = $("<a>")
                .attr({
                    href: card.url,
                    target: "card"
                })
                .text("Check out your new Trello Card")
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
            });
        });
    };
})(jQuery, Trello);