const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {

        // Vérifie si l'header de la requête contient un accessToken
        const authHeader = req.headers.authorization || req.headers.Authorization;

        console.log(req.body);

        if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

        // 'Bearer <token>', split pour obtenir le token
        const token = authHeader.split(' ')[1];

        // Décodage de l'accessToken (et des rôles qu'il contient)
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err) return res.sendStatus(403); // token invalide
            req.username = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;

            //console.log(req.body);

            // Vérification que l'utilisateur possède au moins un des rôles exigés
            if (!req?.roles) return res.sendStatus(401);
            const rolesArray = [...allowedRoles];
            const result = req.roles
                .map(role => rolesArray.includes(role))
                .find(val => val === true);
            if (!result) return res.sendStatus(401);
            
            next();
        });
    };
};

module.exports = verifyRoles;
