const User = require('../models/User');

const handleLogout = async (req, res) => {
    // delete the accessToken on the client
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    // check if refreshToken is in database
    const foundUser = await User.findOne({ refreshToken: refreshToken });
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true });
        return res.sendStatus(204); // Success and no content
    }

    // remove refreshToken in the database
    await User.findOneAndUpdate(
        { refreshToken: refreshToken },
        { $unset: { refreshToken: '' } },
    );

    res.clearCookie('jwt', { httpOnly: true }); // secure: true - only serves on https
    res.sendStatus(204);
};

module.exports = { handleLogout };
