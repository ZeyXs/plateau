const CardGame = require('./CardGame');

class Bataille extends CardGame {

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate) {
        super(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate);
    }

    cardsToWinner(cards, round) {
        for (let player in round) {
          cards.push(round[player]);
        }
    };

}

module.exports = Bataille;