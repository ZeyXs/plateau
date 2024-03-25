const Game = require("../models/Game");
const User = require("../models/User");

class CardGame {
    title;
    size;
    code;
    gameType;
    creatorId;
    creatorName;
    gameState;
    gameData;
    players;
    chat;
    isPrivate;
    socketIds;

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate) {
        this.title = title;
        this.size = size;
        this.code = code;
        this.gameType = gameType;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.gameState = gameState;
        this.gameData = gameData;
        this.players = players;
        this.chat = chat;
        this.isPrivate = isPrivate;
        this.socketIds = {};  
    }

    addPlayer(io, socketId, userId) {
        console.log("Adding player: " + userId);
        this.socketIds[userId] = socketId;
        if (!Object.keys(this.players).includes(userId)) {
            // Cas d'un nouveau joueur
            this.players[userId] = {
                isActive: true,
                hand: [],
                timeLeft: -1,
            };
        } else {
            // Le joueur se reconnecte dans la partie
            this.players[userId].isActive = true;
            this.rejoin(io, userId);
        }
        console.log(this.players)
        this.updatePlayers();
    }

    rejoin(io, userId) {
        // LA METHODE SERA ECRASEE PAR LES SOUS-CLASSES
    }

    removePlayer(userId) {
        console.log("Removing player: " + userId)
        if (this.gameState == "IN_LOBBY") delete this.players[userId]
        else this.players[userId].isActive = false;
        console.log(this.players)
        this.updatePlayers();
    }

    addMessage(message) {
        this.chat.push(message);
    }

    async destruct() {
        await Game.findOneAndDelete({ code: this.code }); 
    }

    async save() {
        await this.destruct();
        const game = new Game({
            title: this.title,
            size: this.size,
            code: this.code,
            gameType: this.gameType,
            creatorId: this.creatorId,
            gameState: this.gameState,
            gameData: this.gameData,
            players: this.players,
            chat: this.chat,
            isPrivate: this.isPrivate
        });
        await game.save();
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

    getCreatorId() {
        return this.creatorId;
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
