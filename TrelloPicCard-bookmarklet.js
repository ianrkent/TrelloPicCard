

// setup our namespace
window.TrelloPicCard = window.TrelloPicCard || {};

(function (window, TrelloPicCard) {
    if (!window.localStorage) {
        // we are currently reliant on local storage.
        return;
    }

    var $;
    var appKeyName = "trelloAppKey";

    TrelloPicCard.appRoot = window.trelloAppRoot;

    // Run several asyncronous functions in order
    var waterfall = function (fxs) {
        var runNext = function () {
            if (fxs.length) {
                fxs.shift().apply(null, Array.prototype.slice.call(arguments).concat([runNext]));
            }
        }
        runNext();
    };

    // Store/retrieve a value from local storage
    TrelloPicCard.store = function (key, value) {
        var storedData = JSON.parse(window.localStorage["TrelloPiccCard"] || '{}');
        if (arguments.length == 2) {
            storedData[key] = value;
            window.localStorage["TrelloPiccCard"] = JSON.stringify(storedData);
        } else {
            return storedData[key];
        }
    };

    // global storage for the users selected list
    TrelloPicCard.selectedList = function(selectedListDetails) {
        if (arguments.length == 1) {
            TrelloPicCard.store("selectedListId", selectedListDetails.listId);
            TrelloPicCard.store("selectedListDisplayName", selectedListDetails.listDisplayName);
        }

        return TrelloPicCard.store("selectedListId") 
            ? {
                listId: TrelloPicCard.store("selectedListId"),
                listDisplayName: TrelloPicCard.store("selectedListDisplayName")
            }
            : void 0;
    }

    var loadJQuery = function(next) {
        if (window.jQuery) {
            next(null);
        } else {
            var script = document.createElement("script");
            script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
            script.onload = next;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    };

    var loadFilesThatDontRelyonTrelloClient = function(ev, next) {
        $ = window.jQuery;

        $('head').append('<link rel="stylesheet" type="text/css" href="' + window.trelloAppRoot + 'css/piccard.css' + '">');
        $.ajax({ url: window.trelloAppRoot + "overlayPrompt.js", dataType: "script" }).done(function() { next() });
    };

    var getUsersSuppliedAppKey = function(next) {
        var appKey = TrelloPicCard.store(appKeyName) || window[appKeyName];
        if (appKey && appKey.length == 32) {
            next(appKey);
        } else {
            TrelloPicCard.overlayPrompt({ 
                html: "Please specify your Trello API Key (you'll only need to do this once per site)<br><br>You can get your API Key <a href='https://trello.com/1/appKey/generate' target='apikey'>here</a><br><br>",
                hasInput: true, 
                callback: function (newAppKey) {
                    if (newAppKey) {
                        next(newAppKey);
                    }
                }
            });
        }
    };

    var loadTrelloClient = function(appKey, next) {
        $.getScript("https://trello.com/1/client.js?key=" + appKey, next);
    };

    var loadResources = function (a, b, c, next) {
        if (TrelloPicCard.appScriptsLoaded) {
            next();
        }

        var root = window.trelloAppRoot;
        $.when($.ajax({ url: root + "cardCreator.js", dataType: "script" }),
                $.ajax({ url: root + "imageSelector.js", dataType: "script" }),
                $.ajax({ url: root + "listSelector.js", dataType: "script" }),
                $.ajax({ url: root + "controlCentre.js", dataType: "script" }),
                $.ajax({ url: root + "run.js", dataType: "script" }))
            .done(function () {
                TrelloPicCard.appScriptsLoaded = true;
                next();
            });
    };

    var AuthoriseAppAgainstTrello = function(next) {
        TrelloPicCard.store(appKeyName, Trello.key());
        Trello.authorize({
            interactive: false,
            success: next,
            error: function() {
                TrelloPicCard.overlayPrompt({ 
                    html: "You need to authorize Trello", 
                    callback: function () {
                        Trello.authorize({
                            type: "popup",
                            name: "Trello PicCard Bookmarklet",
                            expiration: "never",
                            scope: { read: true, write: true },
                            success: next
                        });
                    }
                });
            }
        });
    };

    var selectTrelloList = function(next) {
        if (TrelloPicCard.selectedList()) {
            next();
        } else {
            TrelloPicCard.listSelector(function() {
                next();
            });
        }
    };

    var runUI = function run() {
        TrelloPicCard.run(TrelloPicCard.defaultListId);
    };

    waterfall([
        loadJQuery,
        loadFilesThatDontRelyonTrelloClient,
        getUsersSuppliedAppKey,
        loadTrelloClient,
        loadResources,
        AuthoriseAppAgainstTrello,
        selectTrelloList,
        runUI
    ]);

})(window, TrelloPicCard);
