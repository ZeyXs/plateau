const Game = require('./models/Game');
const User = require('./models/User');

const Bataille = require('./games/Bataille');
const SixQuiPrend = require('./games/SixQuiPrend');
const MilleBornes = require('./games/MilleBornes');

const initGameFetch = async () => {
    let result;
    try {
        const games = await Game.find({ $or: [{gameState: "IN_LOBBY"}, {gameState: "IN_GAME"}, {gameState: "PAUSED"}] });
        if (!games) result = undefined;
        else result = games;
    } catch (err) {
        result = undefined;
    } finally {
        return result;
    }
};


const getPlayerName = async (id) => {
    let result;
    try {
        const user = await User.findOne({ _id: id });
        if (!user) result = undefined;
        else result = user.username;
    } catch (err) {
        result = undefined;
    } finally {
        return result;
    }
}


const getGameData = async (code) => {
    let result;
    try {
        const game = await Game.findOne({ code: code });
        if (!game) result = undefined;
        else result = game;
    } catch (err) {
        result = undefined;
    } finally {
        return result;
    }
};


const isPlayerOwner = async (code, username) => {
    let result;
    try {
        const user = await User.findOne({ username: username });
        if(user) {
            const userId = user._id;
            const game = await Game.findOne({ code: code });
            if(game) {
                if(game.creatorId == userId) result = true;
                else result = false;
            } else console.log(`[socket.js][isPlayerOwner(${code}, ${message})] Error: Game not found.`);
        } else console.log(`[socket.js][isPlayerOwner(${code}, ${message})] Error: User not found.`);
    } catch(err) {
        console.log(`[socket.js][isPlayerOwner(${code}, ${message})] Error: Unknown error.`);
    } finally {
        return result;
    }
}


const addMessageToGame = async (code, message) => {
    try {
        const game = await Game.findOne({ code: code });
        if(game) {
            const modify = await Game.updateOne(
                { code: code },
                { $push: { chat: message } }
            );
        } else console.log(`[socket.js][addMessage(${code}, ${message})] Error: Game not found.`);
    } catch(err) {
        console.log(`[socket.js][addMessage(${code}, ${message})] Error: Unknown error.`)
    }
}

const generateGameInstance = async (gameDataFromDB) => {
    let result;
    const title = gameDataFromDB.title;
    const size = gameDataFromDB.size;
    const code = gameDataFromDB.code;
    const gameType = gameDataFromDB.gameType;
    const creatorId = gameDataFromDB.creatorId;
    const creatorName = await getPlayerName(gameDataFromDB.creatorId);
    const gameState = gameDataFromDB.gameState;
    const gameData = gameDataFromDB.gameData;
    const players = gameDataFromDB.players.toJSON();
    const chat = gameDataFromDB.chat;
    const isPrivate = gameDataFromDB.isPrivate;
    switch(gameType) {
        case "Bataille":
            result = new Bataille(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate);
            break;
        case "SixQuiPrend":
            result = new SixQuiPrend(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate);
            break;
        case "MilleBornes":
            result = new MilleBornes(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate);
            break;
        default:
            result = null;
            break;
    }
    return result;
}






module.exports = { initGameFetch, getPlayerName, getGameData, isPlayerOwner, addMessageToGame, generateGameInstance };