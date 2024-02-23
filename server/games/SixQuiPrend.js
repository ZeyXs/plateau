const CardGame = require('./CardGame');

class SixQuiPrend extends CardGame {

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, deck, players, chat) {
        super(title, size, code, gameType, creatorId, creatorName, gameState, deck, players, chat);
    }

}

module.exports = SixQuiPrend;