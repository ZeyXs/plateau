const CardGame = require('./CardGame');

class Bataille extends CardGame {

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, deck, players, chat) {
        super(title, size, code, gameType, creatorId, creatorName, gameState, deck, players, chat);
    }

}

module.exports = Bataille;