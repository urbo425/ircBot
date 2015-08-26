var config = require('../config.json');

module.exports = function(Brain) {

    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    }

    var cards = [
        {
            card: "A",
            value: 11,
            count: 4
        },
        {
            card: "2",
            value: 2,
            count: 4
        },
        {
            card: "3",
            value: 3,
            count: 4
        },
        {
            card: "4",
            value: 4,
            count: 4
        },
        {
            card: "5",
            value: 5,
            count: 4
        },
        {
            card: "6",
            value: 6,
            count: 4
        },
        {
            card: "7",
            value: 7,
            count: 4
        },
        {
            card: "8",
            value: 8,
            count: 4
        },
        {
            card: "9",
            value: 9,
            count: 4
        },
        {
            card: "10",
            value: 10,
            count: 4
        },{
            card: "J",
            value: 10,
            count: 4
        },{
            card: "Q",
            value: 10,
            count: 4
        },{
            card: "K",
            value: 10,
            count: 4
        },
    ];
    var botName = config.botName;
    var users = [{
        name:botName,
        roll:dealer
    }];
    var usersPlaying = [];

    // function to generate a random card from the deck
    var dealCards = function() {

        // draw a card until card is not null
        while (card == undefined) {
            var card = cards[Math.floor(Math.random() * cards.length)];

            // if card count does not = 0 subtract 1 from count, otherwise remove the object
            if (card.count != 0) {
                card.count = card.count - 1;
                console.log('Card Drawn: ' + card.card);
                console.log('Number left in deck: ' + card.count);
            } else {
                cards.splice(card, 1)
                console.log('Card Removed: ' + card.card);
                card = undefined;
            }

            if (cards.length <= 0) {
                console.log('No Cards!');
            }
        }

        return card;
    }

    var startBj = function() {
        Brain.say('Who wants to play?');

        Brain.defineResponse({
        	type:"public",
        	message:"!bj:me",
        	matching:"exact",
        	handle:function(message, user) {
        		console.log(user);

                if (inArray(user, usersPlaying)) {
                    Brain.say("You're already playing, asshole!")
                } else {
                    usersPlaying.push(user);

                    users.push({
                        name:user,
                        roll:player
                    });

                    console.log(users);

                    Brain.say('Current Players: ' + usersPlaying);
                }
        	}
        })

        Brain.defineResponse({
        	type:"public",
        	message:"!bj:start",
        	matching:"exact",
        	handle:function(message, user) {
                dealCards();
        	}
        })
    }


    Brain.defineResponse({
    	type:"public",
    	message:"!bj",
    	matching:"exact",
    	handle:function() {
    		startBj();

    	}
    })
}
