var Jaraw = require('jaraw');
var reddit = new Jaraw('testing');
var s = require("underscore.string");

module.exports = function() {
    var Quotes = {
        store:[]
    };

    Quotes.pop = function() {
        if(this.store.length <= 1) {
            this.fetch();
        }

        return this.store.shift();
    }

    Quotes.fetch = function() {
        this.store = [];
        reddit.get('/r/quotes.json', this.process);
    }

    Quotes.process = function(err, response) {

        var json = JSON.parse(response);
        var postsLen = json.data.children.length;


        for(var i = 0; i < postsLen; i++) {
            var quote = {
                title:'',
                score:0
            }

            quote.title = json.data.children[i].data.title;
            quote.score = json.data.children[i].data.score;

            Quotes.store.push(quote);
        }
    }

    Quotes.fetch();

    return Quotes;
}
