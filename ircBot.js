// Load the configuration file
var config = require('./config.json');
var request = require('request');

var Jokes = require('./lib/jokes')();
var GuessingGame = require('./lib/guess')();
var Quotes = require('./lib/quotes')();

/*reddit.get('/r/jokes.json', function(err, res) {
	var jokes = JSON.parse(res);
	console.log(jokes.data.children[1].data.title);
	var body = s.stripTags(s.unescapeHTML(jokes.data.children[1].data.selftext_html));
	body = body.replace(/&quot;/g,'"');
	body = body.replace(/&#39;/g, '"');
	console.log(s.lines(body));
});*/

var afkMessages = [];

var commands = [
	"Commands:",
	"!list                    --- shows this list",
	"pull:<repo>              --- sends pull request to repository (dealers is the only current repo)",
	"afk:<username>@<message> --- sends afk message to user who can use !afk to fetch this listings",
	"!afk                     --- fetches afk messages for your username",
];

if(!config.server) {
	console.log('no config file was found...exiting.');
	process.exit();
} else {
	console.log(config.botName + ' has booted successfully!');
	console.log(config.botName + ' is attempting to join ' + config.channels + '...');
}

// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

//here we require the brain file which is basically a class so we init with bot;
var Brain = require('./lib/brain')(bot, config);
var Events = require('./lib/events')(bot);

var BlackJack = require('./lib/blackjack')(Brain);

Events.on('join', function(channel, nick, message) {
	if(nick === config.botName) {
		console.log(config.botName + ' has joined ' + config.channels + ' with success!');
		return;
	}

	Brain.say('welcome to the chat ' + nick + '!');

	if(afkMessages[nick] && afkMessages[nick].length > 0) {
		var total = afkMessages[nick].length;
		Brain.say(nick + ' you have ' + total + ' afk messages waiting for you. use the !afk command!');
	}
});

Brain.defineResponse({
	type:'public',
	message:"!game",
	matching:"exact",
	handle:function(message, from) {
		Brain.say(from + ' is starting the guessing game!');
		Brain.say('use !guess:<number> to submit your guess!');
		GuessingGame.start();
	}
});

Brain.defineResponse({
	type:'public',
	message:"!guess:",
	matching:"loose",
	handle:function(message, from) {
		var guess = message.substring(message.indexOf(":") + 1);

		var response = GuessingGame.check(from, guess);
		Brain.say(response.message);

		if(response.result) {
			Brain.say('Game over! Thanks for playing:' + GuessingGame.users);
		}
	}
})

Brain.defineResponse({
	type:"public",
	message:"!joke",
	matching:"exact",
	handle:function() {
		var joke = Jokes.pop();
		Brain.say(joke.title);

		setTimeout(function () {
			joke.body.push('Reddit Score:' + joke.score);
			joke.body.forEach(function(message) {
				if(!message || message === "")
					return;

				Brain.say(message);
			})
		}, 7000);
	}
})

Brain.defineResponse({
	type:"public",
	message:"!quote",
	matching:"exact",
	handle:function() {
		var quote = Quotes.pop();
		Brain.say(quote.title);

	}
})

Brain.defineResponse({
	type:"public",
	message:"!list",
	matching:"exact",
	handle:function() {
		commands.forEach(function(message) {
			Brain.instance.say(config.channels, message);
		});
	}
});

Brain.defineResponse({
	type:'private',
	message:'say:',
	matching:'loose',
	handle:function(message) {
		message = message.substring(message.indexOf(":") + 1);

		Brain.say(message);
	}
});

//handle pull requests
Brain.defineResponse({
	type:'public',
	message:'!pull:',
	matching:'loose',
	handle:function(message) {
		var pullRequest = message.substring(message.indexOf(":") + 1);
		var repoDetails = config.pullRequests[pullRequest];
		Brain.say('sending pull request to ' + repoDetails.url);
		request.post(repoDetails.url, function(err, response, body) {
			if(err) {
				Brain.say('pull request failed...Response:' + body);
			}else{
				Brain.say('pull request went swimingly!!');
				Brain.say(body);
			}
		});

		return true;
	}
});

Brain.defineResponse({
	type:'private',
	message:"op",
	matching:'loose',
	handle:function(message, from) {
		Brain.instance.send('MODE', config.channels, '+o', from);
		Brain.instance.say(config.channels, from + " has been given OP.");
	}
});

Brain.defineResponse({
	type:'public',
	message:"afk:",
	matching:'loose',
	handle:function(message, from) {
		var afkString = message.substring(message.indexOf(":") + 1);
		var messageArr = afkString.split('@');

		if(afkMessages[messageArr[0]]) {
			afkMessages[messageArr[0]].push(from + ":" + messageArr[1]);
		}else{
			afkMessages[messageArr[0]] = [];
			afkMessages[messageArr[0]].push(from + ":" + messageArr[1]);
		}

		console.log("new afk from:" + from + '->' + messageArr[0] + ":" + messageArr[1]);
	}
});

Brain.defineResponse({
	type:'public',
	message:"!afk",
	matching:'exact',
	handle:function(message, from) {
		if(afkMessages[from] && afkMessages[from].length > 0) {
			Brain.instance.say(config.channels, from + " afk messages:");
			for(var i = 0; i < afkMessages[from].length; i++) {
				var message = afkMessages[from][i];
				Brain.instance.say(config.channels, from + "->" + message);
			}

			afkMessages[from] = [];
		}else{
			Brain.instance.say(config.channels, from + " has no afk messages");
		}
	}
});

bot.addListener('error', function(message) {
	console.log('error: ', message);
});
