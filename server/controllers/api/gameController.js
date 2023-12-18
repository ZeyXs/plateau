const Game = require('../../models/Game');
const User = require('../../models/User');

const HIDE_PLAYERS_HAND = true;
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CODE_LENGTH = 5;

const generateString = (length) => {
    let result = '';
    const charactersLength = CHARACTERS.length;
    for ( let i = 0; i < length; i++ ) {
        result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const generateGameCode = async () => {
    let newCode = generateString(CODE_LENGTH);
    const game = await Game.findOne({ code: newCode });
    if(game) return generateGameCode();
    return newCode;
};

const getUserId = async (username) => {
    const user = await User.findOne({ username: username });
    if(!user?._id) return null;
    return user._id;
}

const hidePlayersHand = (game) => {
    for(const player of game.players.keys()) {
        delete game.players.get(player)["hand"];
    }
};


// __________ GET TYPE FUNCTIONS __________

const getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        if(HIDE_PLAYERS_HAND) for(const game of games) hidePlayersHand(game);
        res.json(games);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getGame = async (req, res) => {
    try {
        const game = await Game.findOne({ code: req.params.code });
        if (!game) return res.status(404).json({ message: 'Game not found.' });
        if(HIDE_PLAYERS_HAND) hidePlayersHand(game);
        res.json(game);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getUserData = async (req, res) => {
    try {
        const game = await Game.findOne({ code: req.params.code });
        if (!game) return res.status(404).json({ message: 'Game not found.' });
        if(HIDE_PLAYERS_HAND) hidePlayersHand(game);
        const userId = await getUserId(req.params.username);
        const userData = game.players.get(userId);
        if(!userId || !userData) return res.status(404).json({ message: 'User not found.' });
        res.json(userData);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// __________ POST TYPE FUNCTIONS __________

const createNewGame = async (req, res) => {
    
    try {

        const { title, size, gameType } = req.body;

        if(!title || !size || !gameType) {
            return res
            .status(400)
            .json({ message: 'Title, size and gameType are required' });
        }

        const creatorId = await getUserId(req.username);
        const playerList = {[creatorId]: {active: false, hand: [], timeLeft: -1}};

        const newGameCode = await generateGameCode();

        const game = new Game({
            title: title,
            size: size,
            code: newGameCode,
            gameType: gameType,
            creatorId: creatorId,
            gameState: "IN_LOBBY",
            deck: [],
            players: playerList
        });
        const newGame = await game.save();
        res.status(201).json({"message": "Partie créée avec succès !", "code": newGame.code});
    } catch (err) {
        res.status(400).json(err.message);
    }
};

module.exports = { getAllGames, getGame, getUserData, createNewGame };
