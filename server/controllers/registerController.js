const bcrypt = require('bcrypt');

const User = require('../models/User');

const handleNewUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: 'Username and password are required.' });
    }
    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ username: username });
    if (duplicate) return res.sendStatus(409); // there is a conflict

    try {
        // encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);
        // store the new user
        const user = new User({
            username: username,
            roles: { User: 2001 },
            password: hashedPwd,
        });
        await user.save();

        res.status(201).json({ success: `New user ${username} created.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { handleNewUser };
