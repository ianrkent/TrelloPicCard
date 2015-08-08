(function(window){
  var $;
  var appNameSpace = "TrelloPicCard";

  /* extend jQuery with a store/restore events */
  var addJqueryPlugins = function($) {

      function obj_copy(obj) {
          var out = {};
          for (i in obj) {
              if (typeof obj[i] == 'object') {
                  out[i] = this.copy(obj[i]);
              }
              else
                  out[i] = obj[i];
          }
          return out;
      }

        $.fn.extend({
            storeEvents: function() {
                this.each(function() {
                    $.data(this, 'storedEvents', obj_copy($(this).data('events')));
                });
                return this;
            },

            restoreEvents: function() {
                this.each(function() {
                    var events = $.data(this, 'storedEvents');
                    if (events) {
                        $(this).unbind();
                        for (var type in events) {
                            for (var handler in events[type]) {
                                $.event.add(
                                    this,
                                    type,
                                    events[type][handler],
                                    events[type][handler].data);
                            }
                        }
                    }
                });
                return this;
            }

        });
    }

  var enableImageSelection = function () {

      var highlightImage = function () {
          var $this = $(this);
          console.log('highlighting', $this);

          $this.data('origCssValues', $this.css(['border-color', 'border-width', 'border-style']));

          $this.css({ 'border-color': "red" });
          $this.css({ 'border-width': '3px' });
          $this.css({ 'border-style': 'solid' });
      }

      var unhighlightImage = function() {
          var $this = $(this);
          console.log('UN-highlighting', $this);
          $this.css($this.data('origCssValues'));
      }

      $("img").each(function (i, image) {
          var img = $(image);
          img.storeEvents();
          img.unbind();
          // img.hover(highlightImage, unhighlightImage);
          img.mouseenter(highlightImage).mouseleave(unhighlightImage)
          img.on('click', function () {
              var $this = $(this);
              addCardForImage($this.attr('src'));
              $this.restoreEvents();
          });
      });

      $()
  }

  /* This is run after we've connected to Trello and selected a list */
  var run = function(Trello, idList) {
        enableImageSelection();
  }

  var addCardForImage = function (imageUrl) {

      console.log(imageUrl);

    var name;

    // Default description is the URL of the page we're looking at
    var desc = location.href;

    // use page title as card title, taking trello as a "read-later" tool
    name = $.trim(document.title);
        
    // Get any selected text
    var selection;

    if(window.getSelection) {
      selection = ""+window.getSelection();
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

        //POST /1/cards/[card id or shortlink]/attachments
        //Required permissions: write
        //Arguments
        //file (optional)
        //Valid Values: A file
        //url (optional)
        //Valid Values: A URL starting with http:// or https:// or null
        //    name (optional)
        //Valid Values: a string with a length from 0 to 256
        //mimeType (optional)
        //Valid Values: a string with a length from 0 to 256

      Trello.post("lists/" + idList + "/cards", { 
        name: name, 
        desc: desc
      }, function (card) {

        // Display a little notification in the upper-left corner with a link to the card
        // that was just created
        var $cardLink = $("<a>")
        .attr({
          href: card.url,
          target: "card"
        })
        .text("Created a Trello Card")
        .css({
          position: "absolute",
          left: 0,
          top: 0,
          padding: "4px",
          border: "1px solid #000",
          background: "#fff",
          "z-index": 1e3
        })
        .appendTo("body")

        setTimeout(function(){
          $cardLink.fadeOut(3000);
        }, 5000)

          // Add the imageUrl as the banner 
        Trello.post("cards/" + card.id + '/attachments', {
            url: imageUrl
        }, function(attachment) {
            console.log(attachment);
        });
      })
    }

    //PUT /1/cards/[card id or shortlink]/idAttachmentCover
    //Required permissions: write
    //Arguments
    //value (required)
    //Valid Values: Id of the image attachment of this card to use as its cover, or null for no cover

  }

  var storage = window.localStorage;
  if(!storage) {
    return;
  }

  // Store/retrieve a value from local storage
  var store = function(key, value){
    if(arguments.length == 2){
      return (storage[key] = value);
    } else {
      return storage[key];
    }
  };

  // A fake "prompt" to get info from the user
  var overlayPrompt = function(html, hasInput, callback){
    var done = function(value){
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
    .click(function(){
      done(null);
    })

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
    .click(function(){
      done($input.val());      
    });

    return $div;
  };

  // Run several asyncronous functions in order
  var waterfall = function(fxs){
    var runNext = function(){
      if(fxs.length){
        fxs.shift().apply(null, Array.prototype.slice.call(arguments).concat([runNext]))
      }
    }
    runNext();
  }

  // The ids of values we keep in localStorage
  var appKeyName = "trelloAppKey";
  var idListName = "trelloIdList";
  var idList;

  waterfall([
    // Load jQuery
    function(next) {
      if(window.jQuery) {
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
      addJqueryPlugins($);

      var appKey = store(appKeyName) || window[appKeyName];
      if(appKey && appKey.length == 32) {
        next(appKey);
      }
      else {
        overlayPrompt("Please specify your Trello API Key (you'll only need to do this once per site)<br><br>You can get your API Key <a href='https://trello.com/1/appKey/generate' target='apikey'>here</a><br><br>", true, function(newAppKey){
          if(newAppKey) {
            next(newAppKey);
          }
        })
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
        error: function(){
          overlayPrompt("You need to authorize Trello", false, function(){
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
      if(idList && idList.length == 24) {
        next();
      } else {
        Trello.get("members/me/boards", { fields: "name" }, function(boards){
          $prompt = overlayPrompt('Which list should cards be sent to?<hr><div class="boards" style="height:500px;overflow-y:scroll"></div>', false, function(){
            idList = $prompt.find("input:checked").attr("id");
            next();
          })

          $.each(boards, function(ix, board){
            $board = $("<div>").appendTo($prompt.find(".boards"))

            Trello.get("boards/" + board.id + "/lists", function(lists){
              $.each(lists, function(ix, list) {
                var $div = $("<div>").appendTo($board);
                idList = list.id;
                $("<input type='radio'>").attr("id", idList).attr("name", "idList").appendTo($div);
                $("<label>").text(board.name + " : " + list.name).attr("for", idList).appendTo($div);
              });
            })
          });
        });
      }      
    },
    // Store the idList for later
    function(next) {
      if(idList) {
        store(idListName, idList);
        next();
      }      
    },
    // Run the user portion
    run
  ]);
})(window);
