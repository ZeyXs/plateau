const { getLevelFromXP, getXPFromLevel } = require('../../config/xpFunctions');
const User = require('../../models/User');

const HIDE_PLAYERS_PASSWORD = true;
const HIDE_PLAYERS_ROLES = true;
const HIDE_PLAYERS_REFRESH_TOKEN = true;

// GET
const getAllUsers = async (req, res) => {
    try {
        let users = await User.find();
        users = JSON.parse(JSON.stringify(users));
        for(let user of users) {
            if(HIDE_PLAYERS_PASSWORD) user.password = undefined;
            if(HIDE_PLAYERS_ROLES) user.roles = undefined;
            if(HIDE_PLAYERS_REFRESH_TOKEN) user.refreshToken = undefined;
            const currentXP = user.xp; const currentLevel = getLevelFromXP(currentXP); const amountOfXPToReachActualLevel = getXPFromLevel(currentLevel);
            const nextLevel = currentLevel + 1; const nextLevelXP = getXPFromLevel(nextLevel);
            const remainingXPToAchieveNextLevel = nextLevelXP - currentXP;
            user.level = currentLevel;
            user.next = Math.ceil(remainingXPToAchieveNextLevel);
            user.previous = Math.ceil(currentXP - amountOfXPToReachActualLevel);    
        }
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getUser = async (req, res) => {
    try {
        let user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if(HIDE_PLAYERS_PASSWORD) user.password = undefined;
        if(HIDE_PLAYERS_ROLES) user.roles = undefined;
        if(HIDE_PLAYERS_REFRESH_TOKEN) user.refreshToken = undefined;
        user = JSON.parse(JSON.stringify(user));
        const currentXP = user.xp; const currentLevel = getLevelFromXP(currentXP); const amountOfXPToReachActualLevel = getXPFromLevel(currentLevel);
        const nextLevel = currentLevel + 1; const nextLevelXP = getXPFromLevel(nextLevel);
        const remainingXPToAchieveNextLevel = nextLevelXP - currentXP;
        user.level = currentLevel;
        user.next = Math.ceil(remainingXPToAchieveNextLevel);
        user.previous = Math.ceil(currentXP - amountOfXPToReachActualLevel);
        res.json(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getUserFromId = async (req, res) => {
    try {
        console.log(req.params.id);
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if(HIDE_PLAYERS_PASSWORD)  user.password = undefined;
        if(HIDE_PLAYERS_ROLES) user.roles = undefined;
        if(HIDE_PLAYERS_REFRESH_TOKEN) user.refreshToken = undefined;




        res.json(user);
    } catch (err) {
        res.status(500).send(err.message);
    } 
}

// POST
/*
const createNewUser = async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            size: req.body.size,
        });
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json(err.message);
    }
};
*/

module.exports = { getAllUsers, getUser, getUserFromId/*, createNewUser*/ };