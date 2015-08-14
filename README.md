```javascript
javascript: (function(a) { window.trelloAppKey = "310dbc0365a96f0db3a82c4cb831c62d"; window.trelloIdList = "optional"; var b = a.createElement("script"); b.src = "https://raw.githubusercontent.com/ianrkent/TrelloPicCard/master/TrelloPicCard-bookmarklet.js"; a.getElementsByTagName("head")[0].appendChild(b)})(document);
```

This is a <a href="http://en.wikipedia.org/wiki/Bookmarklet">bookmarklet</a> you can use to create a card in <a href="https://trello.com">Trello</a>, and select  an image on a web page to be the banner of the card.  This could very useful when it would be easier to identify a card from an image - for example if you had a Trello board to manage houses that you might like to visit as part of a house hunt.

The first time you run it on a particular site, it will walk you through a simple setup:

 1. Authorize the site to interact with Trello
 2. Select the board/list that you'd like the bookmarklet to add cards too

You'll only need to go through those steps once per domain;

The card created in Trello will 

- include a link to the case in the card description
- attach the selected image to the card, and set it as the banner
- (optionally) include any selected text in the description as well

If you modify the unminified bookmarklet, you can re-build it by running the source through a javascript minifier 
(e.g. the <a href="http://closure-compiler.appspot.com/home">Closure Compiler</a>), 
and prepending `javascript:` to the front.

If you'd rather not have to select your list for every new domain, you can modify the bookmarklet and include the list ID for for `window.trelloIdList` which is currently set to  `"optional"`

**Note:** This basic concept originated with https://github.com/markdrago/cardorizer; It was improved on by https://github.com/danlec/Trello-Bookmarklet to not require you to run a server. This is a fork which instead of enabling capturing of trello cards from issues on various known project managment tools, it allows an image based card to be captured from any page.
