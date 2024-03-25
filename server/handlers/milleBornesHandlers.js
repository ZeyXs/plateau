const MilleBornes = require("../games/MilleBornes");

const onMBStart = (io, socket, data, gameInstance) => {
    const code = data.headers.code;
    io.to(code).emit("server.requestHandshake");
    gameInstance.start(io);
}

const onMBPlayedCard = (io, socket, data, gameInstance) => {
    const senderId = data.headers.senderId;
    const selectedCard = data.body.selectedCard;
    const action = data.body.action;
    const targetId = data.body.targetId;
    if((senderId == gameInstance.getCurrentPlayerId()) && (gameInstance.getGameState() != "ENDED")) {
        //console.log(senderId, selectedCard, action, targetId);
        gameInstance.playCard(io, senderId, selectedCard, action, targetId);
    }
}

module.exports = { onMBStart, onMBPlayedCard };