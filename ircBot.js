// Load the configuration file
var config = require('./config.json');
var request = require('request');
var afkMessages = {};
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
	console.log('Bot booted!');
}

// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

//here we require the brain file which is basically a class so we init with bot;
var Brain = require('./lib/brain')(bot, config);

Brain.defineResponse({
	type:"public",
	message:'teach:',
	matching:"loose",
	handle:function(message, from) {
		var message = message.substring(message.indexOf(":") + 1);
		var message = message.split("@");
		console.log('Trained:' + message[0] + " -> " + message[1]);
		Brain.train(message[0], message[1]);
		Brain.say(from + " thanks for teaching me something!");
	}
})

Brain.defineResponse({
	type:"public",
	message:'ask:',
	matching:"loose",
	handle:function(message, from) {
		var message = message.substring(message.indexOf(":") + 1);
		var response = Brain.respond(message);
		Brain.say(from + "::" + response);
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
