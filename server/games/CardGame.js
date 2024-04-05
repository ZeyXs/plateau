const Game = require("../models/Game");
const User = require("../models/User");

class CardGame {
    // _____ Attribut(s) _____
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



    // _____ Constructeur(s) _____
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



    // _____ Méthode(s) _____
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
            if(this.gameState != "PAUSED") this.rejoin(io, userId);
        }
        console.log(this.players)
        this.updatePlayers();
    }

    rejoin(io, userId) {
        throw new Error("Implementation required (ABSTRACT_METHOD_CALLED)");
    }

    resume(io) {
        throw new Error("Implementation required (ABSTRACT_METHOD_CALLED)");
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

    pause() {
        this.gameState = "PAUSED";
        for(let playerId of Object.keys(this.players)) {
            this.players[playerId].isActive = false;
        }
        this.#save();
    }

    async #save() {
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

    areAllPlayersActive() {
        let result = true;
        for(let player of Object.keys(this.players)) {
            if(!this.players[player].isActive) {
                result = false;
                break;
            }
        }
        return result;
    }

    generateConxtext() {
        return {
            gameTitle: this.title,
            gameType: this.gameType,
            gameState: this.gameState,
            players: this.players,
            creatorId: this.creatorId,
            chat: this.chat,
        };
    }

    // _____ Accesseur(s) _____
    setGameState(newGameState) {
        this.gameState = newGameState;
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
