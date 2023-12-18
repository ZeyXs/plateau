const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Vérifie si l'header de la requête contient un accessToken
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    // 'Bearer <token>', split pour obtenir le token
    const token = authHeader.split(' ')[1];

    // Décodage de l'accessToken
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403); // token invalide
        req.user = decoded.UserInfo.username;
        req.roles = decoded.UserInfo.roles;
        next();
    });
};

module.exports = verifyJWT;
