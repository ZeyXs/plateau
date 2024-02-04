const Game = require('./models/Game');
const User = require('./models/User');


var roomToGame = {};


const getGameData = async (code) => {
    let result = "";
    try {
        const game = await Game.findOne({ code: code });
        if (!game) result = undefined;
        else result = game;
    } catch (err) {
        result = undefined;
    } finally {
        return result;
    }
};


const isPlayerOwner = async (code, username) => {
    let result;
    try {
        const user = await User.findOne({ username: username });
        if(user) {
            const userId = user._id;
            const game = await Game.findOne({ code: code });
            if(game) {
                if(game.creatorId == userId) result = true;
                else result = false;
            } else console.log(`[socket.js][isPlayerOwner(${code}, ${message})] Error: Game not found.`);
        } else console.log(`[socket.js][isPlayerOwner(${code}, ${message})] Error: User not found.`);
    } catch(err) {
        console.log(`[socket.js][isPlayerOwner(${code}, ${message})] Error: Unknown error.`);
    } finally {
        return result;
    }
}


const addPlayerToGame = async (code, username) => {
    try {
        const user = await User.findOne({ username: username });
        if(user) {
            const userId = user._id;
            const game = await Game.findOne({ code: code });
            if(game) {
                const player = game.players[userId];
                if(player) {
                    // Le joueur se reconnecte dans la partie
                    const modify = await Game.updateOne(
                        { code: code },
                        { $set: {[`players.${userId}.isActive`] : true} }
                    );
                } else {
                    // Cas d'un nouveau joueur
                    const modify = await Game.updateOne(
                        { code: code },
                        { $set: {[`players.${userId}`] : {
                            isActive: true,
                            hand: [],
                            timeLeft: -1
                        }} }
                    );
                }
            } else console.log(`[socket.js][addPlayerToGame(${code}, ${username})] Error: Game not found.`);
        } else console.log(`[socket.js][addPlayerToGame(${code}, ${username})] Error: User not found.`);
    } catch(err) {
        console.log(`[socket.js][addPlayerToGame(${code}, ${username})] Error: Unknown error.`);
    }
};


const addMessage = async (code, message) => {
    try {
        const game = await Game.findOne({ code: code });
        if(game) {
            const modify = await Game.updateOne(
                { code: code },
                { $push: { chat: message } }
            );
        } else console.log(`[socket.js][addMessage(${code}, ${message})] Error: Game not found.`);
    } catch(err) {
        console.log(`[socket.js][addMessage(${code}, ${message})] Error: Unknown error.`)
    }
}


const deleteGame = async (code) => {
    try {
        const result = await Game.findOneAndDelete({ code: code });
        if(!result) console.log(`[socket.js][deleteGame(${code})] Error: Game not found.`);
    } catch(err) {
        console.log(`[socket.js][deleteGame(${code})] Error: Unknown error.`);
    }
}


const removePlayerFromGame = async (code, username) => {
    try {
        const user = await User.findOne({ username: username });
        if(user) {
            const userId = user._id;
            const game = await Game.findOne({ code: code });
            if(game) {
                const playerList = game.players.toJSON();
                const player = playerList[userId];
                if(player) {
                    const result = await Game.updateOne(
                        { code: code },
                        { $unset: {[`players.${userId}`]: ""} }
                    );
                } else console.log(`[socket.js][removePlayerFromGame(${code}, ${username})] Error: User is not present in the game.`);
            } else console.log(`[socket.js][removePlayerFromGame(${code}, ${username})] Error: Game not found.`);
        } else console.log(`[socket.js][removePlayerFromGame(${code}, ${username})] Error: User not found.`);
    } catch(err) {
        console.log(`[socket.js][removePlayerFromGame(${code}, ${username})] Error: Unknown error.`);
    }
};


const disconnectPlayerFromGame = async (code, username) => {
    try {
        const user = await User.findOne({ username: username });
        if(user) {
            const userId = user._id;
            const game = await Game.findOne({ code: code });
            if(game) {
                const playerList = game.players.toJSON();
                const player = playerList[userId];
                if(player) {
                    const result = await Game.updateOne(
                        { code: code },
                        { $set: {[`players.${userId}.isActive`] : false} }
                    );
                } else console.log(`[socket.js][disconnectPlayerFromGame(${code}, ${username})] Error: User is not present in the game.`);
            } else console.log(`[socket.js][disconnectPlayerFromGame(${code}, ${username})] Error: Game not found.`);
        } else console.log(`[socket.js][disconnectPlayerFromGame(${code}, ${username})] Error: User not found.`);
    } catch(err) {
        console.log(`[socket.js][disconnectPlayerFromGame(${code}, ${username})] Error: Unknown error.`);
    }
};





const sockets = io => {

    io.on('connection', socket => {

        /*
        _____ Message: 'client.join' _____
        In params: { code, username }
        Returns:
            [UNIQUE EMIT] - 'server.joinSuccess' -> { gameTitle, gameType, gameState, chat }
            [GLOBAL EMIT] - 'server.updateChat' -> { message }
            [GLOBAL EMIT] - 'server.updatePlayerNumber' -> { playerNumber }
        */
        socket.on('client.join', async (data) => {
            
            const room = data.code;
            const username = data.username;

            // Ajout du client à la room
            socket.join(room);
            console.log(`[NOTIF] ${username} joined ${room}`);

            // Ajout du joueur à la base de données
            await addPlayerToGame(room, username);

            // Génération d'une instance (si nécessaire)
            if(!Object.keys(roomToGame).includes(room)) {
                // appel du constructeur
                // + ajouter l'instance à roomToGame
            } else {
                // Ajout du joueur dans l'attribut des joueurs
                // /!\ Attention au cas où le joueur est déjà présent dans la partie
                // (i.e. le joueur vient de se reconnecter)
            }

            
            /* __________ REMARQUES IMPORTANTES : __________

            La base de données n'est appelée que :
                - dans le constructeur du jeu,
                    (pour récupérer les données)
                - lors de la connexion/reconnexion d'un joueur
                    (afin de mettre à jour la liste des parties visible depuis la page racine)
                - si le créateur décide de mettre en pause la partie courante
                    (dans ce cas, on stocke les données pour les réutiliser plus tard)

            */


            // Renvoi des données relatives à la partie
            const gameData = await getGameData(room);
            socket.emit('server.joinSuccess', {
                gameTitle: gameData.title,
                gameType: gameData.gameType,
                gameState: gameData.gameState,
                chat: gameData.chat
            });

            // Message d'arrivée du joueur
            const joiningMessage = `👤 ${username} joined the game.`;
            io.to(room).emit('server.updateChat', { message: joiningMessage });
            addMessage(room, joiningMessage);
            
            // Envoi du nouveau nombre de joueurs
            io.to(room).emit('server.updatePlayerNumber', { playerNumber: Object.keys(gameData.players.toJSON()).length });

        });


        /*
        _____ Message: 'client.sendMessage' _____
        In params: { code, username, message }
        Returns:
            [GLOBAL EMIT] - 'server.updateChat' -> { message }
        */
        socket.on('client.sendMessage', async (data) => {
            const room = data.code;
            const username = data.username;
            const message = data.message;
            const newMessage = `[${username}] ${message}`;
            io.to(room).emit('server.updateChat', { message: newMessage });
            addMessage(room, newMessage);
        });




        /*
        _____ Message: 'client.leave' _____
        In params: { code, username }
        Returns: null
        */
        socket.on('client.leave', async (data) => {
            const code = data.code;
            const username = data.username;
            const gameData = await getGameData(code);

            // Si le créateur quitte la partie, on la supprime
            const isGameOwner = await isPlayerOwner(code, username);
            if(isGameOwner) {
                delete roomToGame[code];
                io.to(code).emit('server.leaveSuccess');
                deleteGame(code);
                socket.broadcast.emit('server.refreshGameList');
            }
            
            else {
                // Si le joueur quitte le lobby
                if(gameData.gameState == "IN_LOBBY") await removePlayerFromGame(code, username);

                
                // Si le joueur quitte in-game
                else {
                    await disconnectPlayerFromGame(code, username);
                    socket.emit('server.addToLocalStorage', { code: code });
                }
                
                socket.emit('server.leaveSuccess');
                const newMessage = `👤 ${username} left the game.`
                io.to(code).emit('server.updateChat', { message: newMessage });
                io.to(code).emit('server.updatePlayerNumber', { playerNumber: Object.keys(gameData.players.toJSON()).length-1 });
                addMessage(code, newMessage);

                // Ajouter le retrait du joueur dans l'instance concernée
            }
            console.log(`[NOTIF] ${username} left ${code}`);
            
        });


        /*
        _____ Message: 'disconnecting' _____
        //(default socket message)
        In params: null
        Returns: null
        */
        socket.on('disconnecting', () => {
            console.log("[NOTIF] disconnecting received");
            //socket.emit('server.approvedDisconnection');
        });
    });

    return io;
};

module.exports = sockets;
