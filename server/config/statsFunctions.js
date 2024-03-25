const User = require("../models/User");

const addVictoryTo = async (userId, game) => {
    await User.findOneAndUpdate({ _id: userId }, {
        $inc: { [`stats.${game}.gamesPlayed`]: 1, [`stats.${game}.wins`]: 1 }
    });
}

const addLossTo = async (userId, game) => {
    await User.findOneAndUpdate({ _id: userId }, {
        $inc: { [`stats.${game}.gamesPlayed`]: 1, [`stats.${game}.loses`]: 1 }
    });
}

module.exports = { addVictoryTo, addLossTo };