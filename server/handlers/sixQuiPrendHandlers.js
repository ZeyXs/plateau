const onSixQuiPrendStart = (io, socket, data, gameInstance) => {
    const code = data.headers.code;
    io.to(code).emit('server.requestHandshake');
};

// C'est ici que l'on envoie les informations propre à chaque joueur car on répond
// seulement au socket de l'émetteur et non à tous les sockets de la room.
// ⚠️ C'est donc ici que ce passe le vrai lancement de la partie.
const onSQPReceiveHandshake = (io, socket, data, gameInstance) => {
    const senderId = data.headers.senderId;
    console.log('Player ', senderId, ' has responded.');
    gameInstance.start(io);
};

const onSQPPlayCard = (io, socket, data, gameInstance) => {
    const senderId = data.headers.senderId;
    const selectedCard = data.body.card;
    console.log('A player has send a card');
    gameInstance.playCard(io, senderId, selectedCard);
};

const onBoughtALine = (io, socket, data, gameInstance) => {
    const selectedLine = data.body.lineNumber;
    console.log('_______________Achat ligne________________________');
    console.log(selectedLine);
    console.log(data.body);
    gameInstance.lineBought(io, selectedLine);
};

module.exports = {
    onSixQuiPrendStart,
    onSQPReceiveHandshake,
    onSQPPlayCard,
    onBoughtALine,
};
