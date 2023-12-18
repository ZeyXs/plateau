const User = require('../../models/User');

// GET
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// POST
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

module.exports = { getAllUsers, getUser, createNewUser };
