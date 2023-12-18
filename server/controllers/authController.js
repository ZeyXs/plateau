const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

const handleLogin = async (req, res) => {
    
    // Récupération de l'username et du password contenus dans la requête
    const { username, password } = req.body;

    // Vérifie si la requête contient bien à la fois l'username et le password
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: 'Username and password are required.' });
    }

    // Vérifie l'existence de l'utilisateur dans la base de données
    const foundUser = await User.findOne({ username: username });
    if (!foundUser) return res.sendStatus(401); // Unauthorized

    // Compare le password envoyé avec celui contenu dans la base de données
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        // Récupère les identifiants des différents rôles de l'utilisateur
        const roles = Object.values(foundUser?.roles.toJSON()).filter(Boolean);

        // Création des JWTs
        const accessToken = jwt.sign(
            { UserInfo: { username: username, roles: roles } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10m' },
        );
        const refreshToken = jwt.sign(
            { username: username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' },
        );

        // Sauvegarde du refreshToken dans la base de données pour l'utilisateur courant
        await User.findOneAndUpdate(
            { username: username },
            { refreshToken: refreshToken }
        );

        // Envoie en réponse d'un cookie contenant le refreshToken
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        }); // available for 1 day
        
        res.json({ accessToken, roles });
    
    } else {
        // Mauvais password
        res.sendStatus(401);
    }
};

module.exports = { handleLogin };
