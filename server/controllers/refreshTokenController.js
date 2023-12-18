const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

const handleRefreshToken = async (req, res) => {
    // Récupération du refreshToken contenu dans le cookie 'jwt'
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    // Vérifie s'il existe un utilisateur possédant le même refreshToken dans la BdD 
    const foundUser = await User.findOne({ refreshToken: refreshToken });
    if (!foundUser) return res.sendStatus(401); // Unauthorized

    // On convertit l'objet Mangoose en format JSON
    const userData = foundUser.toJSON();

    // Décodage du refreshToken
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            // Vérification de la validité de celui-ci
            if (err || userData.username !== decoded.username)
                return res.sendStatus(403);

            // Récupération des rôles de l'utilisateur
            const roles = Object.values(userData.roles);

            // Création d'un nouvel accessToken
            const accessToken = jwt.sign(
                { UserInfo: { username: decoded.username, roles: roles } },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10m' },
            );
            
            res.json({ roles, accessToken });
        },
    );
};

module.exports = { handleRefreshToken };
