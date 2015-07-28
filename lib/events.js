/*
    Events
*/
module.exports = function(bot) {
    var Events = {};

    Events.on = function(eventName, callback) {
        bot.addListener(eventName, callback);
    }

    return Events;
}
