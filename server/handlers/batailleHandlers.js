const onBatailleStart = (io, socket, data, gameInstance) => {
    const code = data.headers.code;
    io.to(code).emit("server.requestHandshake");
}

// C'est ici que l'on envoie les informations propre à chaque joueur car on répond
// seulement au socket de l'émetteur et non à tous les sockets de la room.
// ⚠️ C'est donc que ce passe le vrai lancement de la partie.
const onReceiveHandshake = (io, socket, data, gameInstance) => {
    socket.emit("server.startGame");
}

module.exports = { onBatailleStart, onReceiveHandshake };