(function(window){
    var $;

    var promptImageSelection = function (imageProps, imageSelectedCallback) {
        var maxImageDimension = 300;

        var finish = function(selectedUrl) {
            $overlay.remove();
            $scrollableContainer.remove();
            if (selectedUrl) {
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
            .click(function () {
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
        $.each(imageProps, function (idx, imageProp) {
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

    var normalisImgSrcUrl = function (url) {
        console.log(url);
        var el = document.createElement('a');
        el.href = url;
        return el.href;
    };

    /* This is run after we've connected to Trello and selected a list */
    var run = function () {
        var imageUrls = [];

        console.dir(document.location);

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

        promptImageSelection(imageUrls, function(url) {
            addCardForImage(url);
        });
    }

    var addCardForImage = function (imageUrl) {
        var name;

        // Default description is the URL of the page we're looking at
        var desc = location.href;

        // use page title as card title, taking trello as a "read-later" tool
        name = $.trim(document.title);
        
        // Get any selected text
        var selection;

        if(window.getSelection) {
            selection = "" + window.getSelection();
        } else if(document.selection && document.selection.createRange) {
            selection = document.selection.createRange().text;
        }

        // If they've selected text, add it to the name/desc of the card
        if(selection) {
            if(!name) {
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
    }

    var storage = window.localStorage;
    if (!storage) {
        return;
    }

    // Store/retrieve a value from local storage
    var store = function(key, value) {
        if (arguments.length == 2) {
            return (storage[key] = value);
        } else {
            return storage[key];
        }
    };

    // A fake "prompt" to get info from the user
    var overlayPrompt = function(html, hasInput, callback) {
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

    // Run several asyncronous functions in order
    var waterfall = function(fxs) {
        var runNext = function() {
            if (fxs.length) {
                fxs.shift().apply(null, Array.prototype.slice.call(arguments).concat([runNext]))
            }
        }
        runNext();
    };

    // The ids of values we keep in localStorage
    var appKeyName = "trelloAppKey";
    var idListName = "trelloIdList";
    var idList;

    waterfall([
        // Load jQuery
        function(next) {
            if (window.jQuery) {
                next(null);
            } else {
                var script = document.createElement("script");
                script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
                script.onload = next;
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        },
        // Get the user's App Key, either from local storage, or by prompting them to retrieve it
        function(ev, next) {
            $ = window.jQuery;

            var appKey = store(appKeyName) || window[appKeyName];
            if (appKey && appKey.length == 32) {
                next(appKey);
            } else {
                overlayPrompt("Please specify your Trello API Key (you'll only need to do this once per site)<br><br>You can get your API Key <a href='https://trello.com/1/appKey/generate' target='apikey'>here</a><br><br>", true, function(newAppKey) {
                    if (newAppKey) {
                        next(newAppKey);
                    }
                });
            }
        },
        // Load the Trello script
        function(appKey, next) { $.getScript("https://trello.com/1/client.js?key=" + appKey, next); },
        // Authorize our application
        function(a, b, c, next) {
            store(appKeyName, Trello.key())
            Trello.authorize({
                interactive: false,
                success: next,
                error: function() {
                    overlayPrompt("You need to authorize Trello", false, function() {
                        Trello.authorize({
                            type: "popup",
                            name: "Trello PicCard Bookmarklet",
                            expiration: "never",
                            scope: { read: true, write: true },
                            success: next
                        });
                    });
                }
            });
        },
        // Get the list to add cards to, either from local storage or by prompting the user
        function(next) {
            idList = store(idListName) || window[idListName];
            if (idList && idList.length == 24) {
                next();
            } else {
                Trello.get("members/me/boards", { fields: "name" }, function(boards) {
                    $prompt = overlayPrompt('Which list should cards be sent to?<hr><div class="boards" style="height:500px;overflow-y:scroll"></div>', false, function() {
                        idList = $prompt.find("input:checked").attr("id");
                        next();
                    });

                    $.each(boards, function(ix, board) {
                        $board = $("<div>").appendTo($prompt.find(".boards"));

                        Trello.get("boards/" + board.id + "/lists", function(lists) {
                            $.each(lists, function(ix, list) {
                                var $div = $("<div>").appendTo($board);
                                idList = list.id;
                                $("<input type='radio'>").attr("id", idList).attr("name", "idList").appendTo($div);
                                $("<label>").text(board.name + " : " + list.name).attr("for", idList).appendTo($div);
                            });
                        });
                    });
                });
            }
        },
        // Store the idList for later
        function(next) {
            if (idList) {
                store(idListName, idList);
                next();
            }
        },
        // Run the user portion
        run
    ]);
})(window);
