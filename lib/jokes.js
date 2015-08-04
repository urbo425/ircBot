var Jaraw = require('jaraw');
var reddit = new Jaraw('testing');
var s = require("underscore.string");

module.exports = function() {
    var Jokes = {
        store:[]
    };

    Jokes.pop = function() {
        if(this.store.length <= 1) {
            this.fetch();
        }

        return this.store.shift();
    }

    Jokes.fetch = function() {
        this.store = [];
        reddit.get('/r/jokes.json', this.process);
    }

    Jokes.process = function(err, response) {

        var json = JSON.parse(response);
        var postsLen = json.data.children.length;


        for(var i = 0; i < postsLen; i++) {
            var joke = {
                title:'',
                body:[]
            }

            joke.title = json.data.children[i].data.title;

            var body = s.stripTags(s.unescapeHTML(json.data.children[i].data.selftext_html));
            body = body.replace(/&quot;/g,'"');
            body = body.replace(/&#39;/g, '"');
            joke.body = s.lines(body);
            joke.score = json.data.children[i].data.score;

            if(joke.body.length < 10 && json.data.children[i].data.over_18 === false) {
                Jokes.store.push(joke);
            }
        }
    }

    Jokes.fetch();

    return Jokes;
}
