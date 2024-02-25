const Game = require("../models/Game");
const User = require("../models/User");

const CardGame = class {
    title;
    size;
    code;
    gameType;
    creatorId;
    creatorName;
    gameState;
    deck;
    players;
    chat;

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, deck, players, chat) {
        this.title = title;
        this.size = size;
        this.code = code;
        this.gameType = gameType;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.gameState = gameState;
        this.deck = deck;
        this.players = players;
        this.chat = chat;
    }

    async addPlayer(username) {
        const playerId = await this.getPlayerId(username);
        if (!Object.keys(this.players).includes(playerId)) {
            // Cas d'un nouveau joueur
            this.players[playerId] = {
                isActive: true,
                hand: [],
                timeLeft: -1,
            };
        } else {
            // Le joueur se reconnecte dans la partie
            this.players[playerId].isActive = true;
        }

        this.updatePlayers();
    }

    async removePlayer(username) {
        const playerId = await this.getPlayerId(username);
        if (this.gameState == "IN_LOBBY") delete this.players[playerId]
        else this.players[playerId].isActive = false;
        this.updatePlayers();
    }

    addMessage(message) {
        this.chat.push(message);
    }

    async destruct() {
        await Game.findOneAndDelete({ code: this.code }); 
    }

    save() {
        const game = new Game({
            title: this.title,
            size: this.size,
            code: this.code,
            gameType: this.gameType,
            creatorId: this.creatorId,
            gameState: this.gameState,
            deck: this.deck,
            players: this.players,
            chat: this.chat,
        });
        game.save();
    }

    async updatePlayers() {
        await Game.updateOne({ code: this.code }, { $set: { ['players']: this.players }});
    }

    getTitle() {
        return this.title;
    }

    getGameType() {
        return this.gameType;
    }

    getGameState() {
        return this.gameState;
    }

    getChat() {
        return this.chat;
    }

    getPlayers() {
        return this.players;
    }

    getCreatorName() {
        return this.creatorName;
    }

    getSize() {
        return this.size;
    }

    async getPlayerId(username) {
        let result;
        try {
            const user = await User.findOne({ username: username });
            if (!user) result = undefined;
            else result = user._id;
        } catch (err) {
            result = undefined;
        } finally {
            return result;
        }
    }

};

module.exports = CardGame;
