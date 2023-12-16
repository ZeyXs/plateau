const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: 'Username and password are required.' });
    }
    const foundUser = await User.findOne({ username: username });
    if (!foundUser) return res.sendStatus(401); // Unauthorized
    // evaluate password
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser?.roles.toJSON()).filter(Boolean);
        console.log(roles);
        // create JWTs
        const accessToken = jwt.sign(
            { UserInfo: { username: username, roles: roles } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1m' },
        );
        const refreshToken = jwt.sign(
            { username: username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' },
        );
        // saving refresh token with current user
        await User.findOneAndUpdate(
            { username: username },
            { refreshToken: refreshToken },
        );
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        }); // available for 1 day
        res.json({ accessToken, roles });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { handleLogin };
