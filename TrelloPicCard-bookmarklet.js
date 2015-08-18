// setup our namespace
window.TrelloPicCard = window.TrelloPicCard || {};

(function (window, TrelloPicCard) {

    if (!window.localStorage) {
        // we are currently reliant on local storage.
        return;
    }
    
    var $;
    var idList;

    // Store/retrieve a value from local storage
    TrelloPicCard.store = function (key, value) {
        if (arguments.length == 2) {
            return (window.localStorage[key] = value);
        } else {
            return window.localStorage[key];
        }
    };

    // Run several asyncronous functions in order
    var waterfall = function(fxs) {
        var runNext = function() {
            if (fxs.length) {
                fxs.shift().apply(null, Array.prototype.slice.call(arguments).concat([runNext]));
            }
        }
        runNext();
    };

    // The ids of values we keep in localStorage
    var appKeyName = "trelloAppKey";
    var idListName = "trelloIdList";
    

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

        // Load the overlay prompt
        function (ev, next) {
            $ = window.jQuery;

            $.ajax({ url: window.trelloAppRoot + "overlayPrompt.js", dataType: "script" }).done(function () { next() });
        },

        // Get the user's App Key, either from local storage, or by prompting them to retrieve it
        function(next) {
            var appKey = TrelloPicCard.store(appKeyName) || window[appKeyName];
            if (appKey && appKey.length == 32) {
                next(appKey);
            } else {
                TrelloPicCard.overlayPrompt("Please specify your Trello API Key (you'll only need to do this once per site)<br><br>You can get your API Key <a href='https://trello.com/1/appKey/generate' target='apikey'>here</a><br><br>", true, function (newAppKey) {
                    if (newAppKey) {
                        next(newAppKey);
                    }
                });
            }
        },

        // Load the Trello script
        function(appKey, next) {
             $.getScript("https://trello.com/1/client.js?key=" + appKey, next);
        },

        // load other scripts in the app, and create our namespace
        function (a, b, c, next) {
            if (TrelloPicCard.appScriptsLoaded) {
                next();
            }

            var root = window.trelloAppRoot;
            $.when($.ajax({ url: root + "cardCreator.js", dataType: "script" }),
                    $.ajax({ url: root + "imageSelector.js", dataType: "script" }),
                    $.ajax({ url: root + "newCardProps.js", dataType: "script" }),
                    $.ajax({ url: root + "run.js", dataType: "script" }))
            .done(function () {
                TrelloPicCard.appScriptsLoaded = true;
                next();
            });
        },

        // Authorize our application
        function(next) {
            TrelloPicCard.store(appKeyName, Trello.key());
            Trello.authorize({
                interactive: false,
                success: next,
                error: function() {
                    TrelloPicCard.overlayPrompt("You need to authorize Trello", false, function () {
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
            idList = TrelloPicCard.store(idListName) || window[idListName];
            if (idList && idList.length == 24) {
                next();
            } else {
                Trello.get("members/me/boards", { fields: "name" }, function(boards) {
                    $prompt = TrelloPicCard.overlayPrompt('Which list should cards be sent to?<hr><div class="boards" style="height:500px;overflow-y:scroll"></div>', false, function () {
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
                TrelloPicCard.store(idListName, idList);
                next();
            }
        },

        // Run the user portion
        function run() {
            TrelloPicCard.run(idList);
        }
    ]);
})(window, TrelloPicCard);
