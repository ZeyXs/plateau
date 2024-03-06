const CardGame = require('./CardGame');

class SixQuiPrend extends CardGame {

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat) {
        super(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat);
    }

}

module.exports = SixQuiPrend;