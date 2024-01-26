const User = require('../../models/User');

const HIDE_PLAYERS_PASSWORD = true;
const HIDE_PLAYERS_ROLES = true;
const HIDE_PLAYERS_REFRESH_TOKEN = true;

// GET
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        for(const user of users) {
            console.log(user);
            if(HIDE_PLAYERS_PASSWORD)  user.password = undefined;
            if(HIDE_PLAYERS_ROLES) user.roles = undefined;
            if(HIDE_PLAYERS_REFRESH_TOKEN) user.refreshToken = undefined;
        }
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getUser = async (req, res) => {
    try {
        console.log(req.params.username);
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if(HIDE_PLAYERS_PASSWORD)  user.password = undefined;
        if(HIDE_PLAYERS_ROLES) user.roles = undefined;
        if(HIDE_PLAYERS_REFRESH_TOKEN) user.refreshToken = undefined;
        res.json(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

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

module.exports = { getAllUsers, getUser/*, createNewUser*/ };
