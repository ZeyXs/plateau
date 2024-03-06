const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    title: { type: String, required: true },
    size: { type: Number, required: true },
    code: { type: String, required: true},
    gameType: { type: String, required: true },
    creatorId: { type: String, required: true},
    gameState: { type: String },
    gameData: { type: Object },
    players: { type: Map },
    chat: { type: Array, of: String }
});


module.exports = mongoose.model('game', GameSchema);
