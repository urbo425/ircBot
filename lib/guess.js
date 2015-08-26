module.exports = function() {
    var Game = {
        answer:0,
        status:'ready',
        users:[]
    };

    Game.start = function() {
        this.answer = Math.floor((Math.random() * 100) + 1);
        this.status = 'in-progress';
    }

    Game.join = function(user) {
        this.users.push(user);
    }

    Game.check = function(user, guess) {
        var response = {
            message:'',
            result:false
        };

        if(guess == Game.answer) {
            response.message = user + ' is the winner! The number was ' + Game.answer;
            response.result = true;
            this.status = 'finished';


        }else if(guess < Game.answer) {
            response.message = user + ' higher!';
        }else if(guess > Game.answer) {
            response.message = user + ' lower!';
        }

        return response;
    }

    return Game;
}
