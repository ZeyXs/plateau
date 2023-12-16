const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken: refreshToken });
    if (!foundUser) return res.sendStatus(401); // Unauthorized
    const userData = foundUser.toJSON()

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || userData.username !== decoded.username)
                return res.sendStatus(403);
            const roles = Object.values(userData.roles);
            const accessToken = jwt.sign(
                { UserInfo: { username: decoded.username, roles: roles } },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1m' },
            );
            res.json({ roles, accessToken });
        },
    );
};

module.exports = { handleRefreshToken };
