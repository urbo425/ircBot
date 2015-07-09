// Load the configuration file
var config = require('./config.json');

if(!config.server) {
	console.log('no config file was found...exiting.');
	process.exit();
} else {
	console.log('App Started Successfully!');
}

// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

// Listen for joins
bot.addListener("join", function(channel, who) {
	// Welcome them in!
	bot.say(channel, who + "...sup brah...welcome back!");

	//op user in array
	/*if(config.ops) {
		for(var i = 0; i < config.ops.length; i++) {
			var username = config.ops[i];

			if(who == username) {
				bot.send('MODE', config.channels, '+o', who);
			}
		}
	}*/
});

// Listens for messages to the channel
bot.addListener('message' + config.channels, function (from, message) {
	if (message == config.botMessage + " " + config.botName) {
		console.log(from + ' => ' + config.channels + ': ' + message);
		bot.say(config.channels, "yo dude!");
	}
});

bot.addListener('pm', function (from, message) {
	if (message == config.opPhrase) {
		bot.send('MODE', config.channels, '+o', from);
    	console.log('Gave OP to user: ' + from + ' in ' + config.channels);
	}
});

bot.addListener('error', function(message) {
	console.log('error: ', message);
});
