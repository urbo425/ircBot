module.exports = function(bot, config) {
    var Brain = {
        instance:bot,
        store:[]
    };

    //define a case on how cmeBot should responed to messages
    /*
        Config:{
            type:public, private
            message: message to look for
            matching:exact, loose,
            handler:function to run
        }
    */
    Brain.defineResponse = function(config) {

        if(config.type === 'public') {
            this.newPublicResponseDefinition(config);
        }else if(config.type === 'private'){
            this.newPrivateResponseDefinition(config);
        }

        return true;

    }

    Brain.newPrivateResponseDefinition = function(config) {
        this.instance.addListener('pm', function(from, message) {
            if(Brain.matchString(message, config.message, config.matching)) {
                config.handle(message, from);
            }
        });
    }

    Brain.newPublicResponseDefinition = function(config) {
        this.instance.addListener('message', function(from, to, message) {
            if(Brain.matchString(message, config.message, config.matching)) {
                config.handle(message, from, to);
            }
        });
    }

    Brain.say = function(message) {
        Brain.instance.say(config.channels, message);
    }

    Brain.matchString = function(baseString, testString, mode) {
        var result = false;

        if(mode === 'exact') {
            if(baseString === testString) {
                result = true;
            }
        }else if(mode === 'loose'){
            if(baseString.indexOf(testString) > -1) {
                result = true;
            }
        }

        return result;
    }

    return Brain;
}
