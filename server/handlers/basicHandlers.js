const Game = require("../models/Game");
const User = require("../models/User");
const { generateGameInstance, getGameData } = require("../utils");

// REMARQUE: vu que la db n'est pas save() au moment de l'utilisation de cette fonction, 
// il faut aller chercher manuellement les joueurs et leur PP pour obtenir la même
// réponse que la route '/api/game/:code/players'.
const updatePlayers = async (io, code, gameInstance) => {
    let players = {};
    for (playerId of Object.keys(gameInstance.getPlayers())) {
        await User.findOne({ _id: playerId }).then((data) => {
            players[playerId] = {
                username: data.username,
                profilePicture: data.profilePicture
            };
        });
    }
    io.to(code).emit("server.updatePlayers", {
        players: players,
    });
}

const onClientJoin = async (io, socket, data, gameInstance, roomToGame) => {
    const code = data.headers.code;
    const gameType = data.headers.gameType;
    const userId = data.headers.senderId;
    const username = data.headers.senderUsername;

    // Ajout du client à la room
    socket.join(code);

    // Génération d'une instance (si nécessaire)
    if (gameInstance == undefined) {
        let data = await getGameData(code);
        roomToGame[code] = await generateGameInstance(data);
        gameInstance = roomToGame[code];
    }

    // Ajout du joueur à la partie
    gameInstance.addPlayer(io, socket.id, userId);

    // Renvoi des données relatives à la partie
    let gameContext;
    gameContext = await gameInstance.generateGameContext();
    socket.emit("server.joinSuccess", gameContext);

    // Message d'arrivée du joueur
    const joiningMessage = `👤 ${username} joined the game.`;
    gameInstance.addMessage(joiningMessage);
    io.to(code).emit("server.updateChat", { message: joiningMessage });

    // Envoi du nouveau nombre de joueurs
    io.to(code).emit("server.updatePlayerNumber", {
        playerNumber: Object.keys(gameInstance.getPlayers()).length,
        size: gameInstance.getSize(),
    });

    // Update de la liste des joueurs
    updatePlayers(io, code, gameInstance);

    // Reprendre la partie si nécessaire
    if(gameInstance.getGameState() == "PAUSED" && gameInstance.areAllPlayersActive()) {
        gameInstance.setGameState("IN_GAME");
        await Game.findOneAndUpdate({ code: code }, { gameState: "IN_GAME" });
        io.to(code).emit("server.resume");
        gameInstance.resume(io);
    }
};

const onPlayerLeave = async (io, socket, data, gameInstance, roomToGame) => {
    const code = data.headers.code;
    const userId = data.headers.senderId;
    const username = data.headers.senderUsername;
    if (gameInstance == undefined) {
        return;
    }
    if (gameInstance.getCreatorId() == userId) {
        // Si le créateur quitte la partie, on la supprime :
        await gameInstance.destruct();
        delete roomToGame[code];
        io.to(code).emit("server.leave");
        socket.broadcast.emit("server.refreshGameList");
    } else {
        // Si un joueur (outre le créateur) quitte la partie :
        gameInstance.removePlayer(userId);

        // Message de départ du joueur
        const newMessage = `👤 ${username} left the game.`;
        gameInstance.addMessage(newMessage);
        io.to(code).emit("server.updateChat", { message: newMessage });

        // Envoi du nouveau nombre de joueurs
        io.to(code).emit("server.updatePlayerNumber", {
            playerNumber: Object.keys(gameInstance.getPlayers()).length,
            size: gameInstance.getSize(),
        });

        // Update de la liste des joueurs
        updatePlayers(io, code, gameInstance);
    }
    console.log(`[NOTIF] ${username} left ${code}`);
};

const onSave = (io, socket, data, gameInstance) => {
    const code = data.headers.code;
    const senderId = data.headers.senderId;

    console.log("_____ Demande de Save: _____");
    console.log("creatorId =", gameInstance.getCreatorId());
    console.log("senderId =", senderId);

    if(senderId == gameInstance.getCreatorId() && gameInstance.getGameState() == "IN_GAME") {
        gameInstance.pause();
        io.to(code).emit("server.leave");
    }
}

const onNewChatMessage = async (io, socket, data, gameInstance) => {
    const code = data.headers.code;
    const username = data.headers.senderUsername;
    const message = data.body.message;
    const newMessage = `[${username}] ${message}`;
    gameInstance.addMessage(newMessage); // Remarque: la méthode ajoutera le message à son attribut 'chat'
    io.to(code).emit("server.updateChat", { message: newMessage });
};

const onStartTimer = (io, data) => {
    const code = data.headers.code;
    const players = data.body.players;
    io.to(code).emit("server.startTimer", {players: players});
}

module.exports = { onClientJoin, onPlayerLeave, onNewChatMessage, onStartTimer, onSave };