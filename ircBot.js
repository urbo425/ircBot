// Load the configuration file
var config = require('./config.js');

if(!config.server) {
	console.log('no config file was found...exiting.');
	process.exit();
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
	if(config.ops) {
		for(var i = 0; i < config.ops.length; i++) {
			var username = config.ops[i];

			if(who == username) {
				bot.send('MODE', '#SomeChannel', '+o', who);
			}
		}
	}
});
