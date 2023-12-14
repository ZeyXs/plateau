const Game = require('../../models/Game');

// GET
const getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: 'Game not found.' });
        res.json(game);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// POST
const createNewGame = async (req, res) => {
    try {
        const game = new Game({
            name: req.body.name,
            size: req.body.size,
        });
        const newGame = await game.save();
        res.status(201).json(newGame);
    } catch (err) {
        res.status(400).json(err.message);
    }
};

module.exports = { getAllGames, getGame, createNewGame };
