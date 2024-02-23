const { generateGameInstance, getGameData } = require('../utils');


const onClientJoin = async (io, socket, data, gameInstance, roomToGame) => {

    const code = data.headers.code;
    const gameType = data.headers.gameType;
    const username = data.body.username;

    // Ajout du client à la room
    socket.join(code);
    console.log(`[NOTIF] ${username} joined ${code}`);

    // Génération d'une instance (si nécessaire)
    if(gameInstance == undefined) { /* !Object.keys(roomToGame).includes(code) */
        let data = await getGameData(code);
        console.log(data);
        roomToGame[code] = await generateGameInstance(data); // appel du constructeur + ajouter l'instance à roomToGame
        gameInstance = roomToGame[code];
    }
    await gameInstance.addPlayer(username);

    // Renvoi des données relatives à la partie
    socket.emit('server.joinSuccess', {
        gameTitle: gameInstance.getTitle(),
        gameType: gameInstance.getGameType(),
        gameState: gameInstance.getGameState(),
        chat: gameInstance.getChat()
    });

    // Message d'arrivée du joueur
    const joiningMessage = `👤 ${username} joined the game.`;
    gameInstance.addMessage(joiningMessage);
    io.to(code).emit('server.updateChat', { message: joiningMessage });

    // Envoi du nouveau nombre de joueurs
    console.log(gameInstance.getPlayers());
    console.log(Object.keys(gameInstance.getPlayers()).length);
    io.to(code).emit('server.updatePlayerNumber', { playerNumber: Object.keys(gameInstance.getPlayers()).length });

}


const onPlayerLeave = async (io, socket, data, gameInstance, roomToGame) => {
    const code = data.headers.code;
    const username = data.body.username;
    if(gameInstance.getCreatorName() == username) {
        // Si le créateur quitte la partie, on la supprime :
        await gameInstance.destruct(); // Remarque: la méthode se chargera de la suppression dans la base de données
        delete roomToGame[code];
        io.to(code).emit('server.leaveSuccess');
        socket.broadcast.emit('server.refreshGameList');
    } else {
        // Si un joueur (outre le créateur) quitte la partie :
        await gameInstance.removePlayer(username);
        if (gameInstance.gameState === "IN_GAME") socket.emit('server.addToLocalStorage', { code: code });
        socket.emit('server.leaveSuccess');
        const newMessage = `👤 ${username} left the game.`;
        gameInstance.addMessage(newMessage);
        io.to(code).emit('server.updateChat', { message: newMessage });
        io.to(code).emit('server.updatePlayerNumber', { playerNumber: Object.keys(gameInstance.getPlayers()).length });
    }
    console.log(`[NOTIF] ${username} left ${code}`);
}


const onNewChatMessage = async (io, socket, data, gameInstance) => {
    const code = data.headers.code;
    const username = data.body.username;
    const message = data.body.message;
    const newMessage = `[${username}] ${message}`;
    gameInstance.addMessage(newMessage); // Remarque: la méthode ajoutera le message à son attribut 'chat'
    io.to(code).emit('server.updateChat', { message: newMessage });
}


module.exports = { onClientJoin, onPlayerLeave, onNewChatMessage }