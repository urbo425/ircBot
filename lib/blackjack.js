var config = require('../config.json');

module.exports = function(Brain) {

    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    }

    var inProgress = false;

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
        role:"dealer",
        cards:[],
        value:0,
        stay:false,
        bust:false
    }];
    var usersPlaying = [];

    // function to generate a random card from the deck
    var dealCards = function() {

        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.role == "dealer") {
                while (user.value < 17) {
                    var card = cards[Math.floor(Math.random() * cards.length)];
                    // if card count does not = 0 subtract 1 from count, otherwise remove the object
                    if (card.count != 0) {
                        var newValue;

                        card.count = card.count - 1;
                        user.cards.push(card.card);
                        newValue = user.value + card.value;
                        user.value = newValue;
                        console.log(users);

                    } else {

                        cards.splice(card, 1)
                        console.log('Card Removed: ' + card.card);

                    }
                }

                if (cards.length <= 0) {
                    console.log('No Cards!');
                }

            } else if (user.role == "player") {
                while (user.cards.length < 2) {
                    var card = cards[Math.floor(Math.random() * cards.length)];
                    // if card count does not = 0 subtract 1 from count, otherwise remove the object
                    if (card.count != 0) {
                        var newValue;

                        card.count = card.count - 1;
                        user.cards.push(card.card);
                        newValue = user.value + card.value;
                        user.value = newValue;
                        console.log(users);

                    } else {

                        cards.splice(card, 1)
                        console.log('Card Removed: ' + card.card);

                    }
                }
            }
        }

        for (var i = 0; i < users.length; i++) {
            Brain.say(users[i].name + " is sitting at a value of " + users[i].value);
            Brain.say("Cards in hand: " + users[i].cards);

            if (users[i].value > 21) {
                Brain.say(users[i].name + " busts!");
                users[i].bust = true;
            } else if (users[i].value == 21) {
                Brain.say(users[i].name + " has Blackjack!  Game Over!")
            }
        }

        Brain.say("Type !bj:hit to draw another card or !bj:stay");

        // listens for a user to request an additional card
        Brain.defineResponse({
            type:"public",
            message:"!bj:hit",
            matching:"exact",
            handle:function(message, user) {
                drawCard(user);
            }
        })

        return card;
    }

    var drawCard = function(name) {
        console.log("function ran");
        if (inArray(name, usersPlaying)) {

            for (var i = 0; i < users.length; i++) {
                if (users[i].name == name) {
                    var hittingUser = users[i];
                }
            }

            while (card == undefined) {
                var card = cards[Math.floor(Math.random() * cards.length)];
                // if card count does not = 0 subtract 1 from count, otherwise remove the object
                if (card.count != 0) {
                    var newValue;

                    card.count = card.count - 1;
                    hittingUser.cards.push(card.card);
                    newValue = hittingUser.value + card.value;
                    hittingUser.value = newValue;
                    console.log(users);
                    Brain.say(name + " is now sitting at " + newValue);

                    if (users[i].value > 21) {
                        Brain.say(name + " busts!");
                        hittingUser.bust = true;
                    } else if (users[i].value == 21) {
                        Brain.say(name + " has Blackjack!  Game Over!")
                    }

                } else {

                    cards.splice(card, 1)
                    console.log('Card Removed: ' + card.card);
                    card = undefined;

                }
            }
        }
    }

    // Starts blackjack and get an array of players
    var startBj = function() {
        Brain.say('Who wants to play?');

        // listens for a user to request entry to the game
        Brain.defineResponse({
        	type:"public",
        	message:"!bj:me",
        	matching:"exact",
        	handle:function(message, user) {
        		console.log(user);

                // checks if the user already exists
                if (inArray(user, usersPlaying)) {
                    Brain.say("You're already playing, asshole!")
                } else {
                    usersPlaying.push(user);

                    users.push({
                        name:user,
                        role:"player",
                        cards:[],
                        value:0,
                        stay:false,
                        bust:false
                    });

                    console.log(users);

                    Brain.say('Current Players: ' + usersPlaying);
                }
        	}
        })

        // starts the game
        Brain.defineResponse({
        	type:"public",
        	message:"!bj:start",
        	matching:"exact",
        	handle:function() {
                if (inProgress === false) {
                    inProgress = true;
                    dealCards();
                } else {
                    Brain.say('Game already in progress!')
                }
        	}
        })
    }

    var userStay = function()

    // innitiates the blackjack script
    Brain.defineResponse({
    	type:"public",
    	message:"!bj",
    	matching:"exact",
    	handle:function() {
            if (inProgress === true) {
        		Brain.say('Game already in progress!')
            } else {
                startBj();
            }
    	}
    })
}
