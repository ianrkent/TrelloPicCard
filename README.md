```javascript
javascript: (function(a) { window.trelloAppRoot="https://rawgit.com/ianrkent/TrelloPicCard/master/"; window.trelloAppKey="optional"; window.trelloIdList="optional"; var b = a.createElement("script"); b.src = window.trelloAppRoot + "TrelloPicCard-bookmarklet.js"; a.getElementsByTagName("head")[0].appendChild(b)})(document);
```

This is a <a href="http://en.wikipedia.org/wiki/Bookmarklet">bookmarklet</a> you can use to create a card in <a href="https://trello.com">Trello</a>, and select an image on a web page to be the banner of the card.  This could very useful when it would be easier to identify a card from an image - for example if you had a Trello board to manage houses that you might like to visit as part of a house hunt.

The first time you run it on a particular site, it will walk you through a simple setup:

 1. Input your own Trello App key (for security reasons), and authorize the site to interact with Trello
 2. Select the board/list that you'd like the bookmarklet to add cards too

You'll only need to go through those steps once per domain.

The card created in Trello will 

- include a link to the page in the card description
- attach the selected image to the card, and set it as the banner
- (optionally) include any selected text in the description as well

Each time you add a new card you will have the option to change the list it will get added to, and edit the name that will be given to the card.

If you'd rather not have to input your App Key and/or select your list the first time for every new domain, you can modify the bookmarklet and 
- include your list ID for `window.trelloIdList` which is currently set to  `"optional"`
- include your App Key  for `window.trelloAppKey` which is currently set to  `"optional"`

**Note:** This basic concept originated with https://github.com/markdrago/cardorizer; It was improved on by https://github.com/danlec/Trello-Bookmarklet to not require you to run a server. This is a fork which instead of enabling capturing of trello cards from issues on various known project managment tools, it allows an image based card to be captured from any page.
