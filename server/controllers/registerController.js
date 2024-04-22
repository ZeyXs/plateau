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
            password: hashedPwd,
        });
        await user.save();

        res.status(201).json({ success: `New user ${username} created.` });
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { handleNewUser };