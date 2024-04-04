const bcrypt = require('bcrypt');

const User = require('../models/User');

const handleNewUser = async (req, res) => {

    // Récupération de l'username et du password contenus dans la requête
    const { username, password } = req.body;

    // Vérifie si la requête contient bien à la fois l'username et le password
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: 'Username and password are required.' });
    }

    // Vérifie s'il existe déjà un utilisateur possèdant se pseudo 
    const duplicate = await User.findOne({ username: username });
    if(duplicate) return res.sendStatus(409); // conflit

    try {
        // Encryption du password
        const hashedPwd = await bcrypt.hash(password, 10);
        // Création du nouvel utilisateur et ajout de celui-ci dans la base de données
        const user = new User({
            username: username,
            roles: { User: 2001 },
            password: hashedPwd,
            profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            stats: {
                "bataille": {
                    "gamesPlayed": 0,
                    "wins":0,
                    "loses":0
                },
                "sixQuiPrend": {
                    "gamesPlayed": 0,
                    "wins":0,
                    "loses":0,
                    "avgPointsPerGame": 0
                },
                "millesBornes": {
                    "gamesPlayed": 0,
                    "wins":0,
                    "loses":0
                }
            }
        });
        await user.save();

        res.status(201).json({ success: `New user ${username} created.` });
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { handleNewUser };
