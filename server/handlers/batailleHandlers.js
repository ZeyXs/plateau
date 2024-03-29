// C'est ici que l'on envoie les informations propre à chaque joueur car on répond
// seulement au socket de l'émetteur et non à tous les sockets de la room.
// ⚠️ C'est donc ici que ce passe le vrai lancement de la partie.
const onReceiveHandshake = (io, socket, data, gameInstance) => {
    /*console.log("onReceiveHandshake")
    const userId = data.headers.senderId;
    socket.emit('server.playerData', {
        infos: gameInstance.getPlayers()[userId],
    });*/
    gameInstance.deal(io);
};

const onBatailleStart = async (io, socket, data, gameInstance) => {
    console.log("onGameStart")
    const code = data.headers.code;
    io.to(code).emit('server.requestHandshake');
};

const playerBatailleSelectedCard = async (io, socket, data, gameInstance) => {
    const userId = data.headers.senderId;
    const card = gameInstance.stringToCard(data.body.card);
    gameInstance.setRoundGameData(userId, card);
    gameInstance.deleteCard(userId, card);
    gameInstance.winnerGame(io);
    io.to(data.headers.code).emit('server.otherCardPlayed', {
        user: userId,
        userCard: card,
    });
    if (!gameInstance.emptyTabExists(gameInstance.getRoundGameData())) {
        gameInstance.cardsToWinner(
            gameInstance.getCardsWinnerGameData(),
            gameInstance.getRoundGameData(),
        );
        let winner = gameInstance.roundWinner();
        if (winner.length > 1) {
            let listPlayersToReplay =
                gameInstance.getListPlayersToReplay(winner);
            gameInstance.askHiddenCard(listPlayersToReplay, io);
            gameInstance.setRoundGameData({});
            gameInstance.initRoundGameData(listPlayersToReplay);
        } else {
            io.to(data.headers.code).emit('server.roundWinners', {
                roundWinners: winner,
                cards: gameInstance.getCardsWinnerGameData(),
            });
            players = gameInstance.getPlayers();
            players[winner].hand = players[winner].hand.concat(
                gameInstance.getCardsWinnerGameData(),
            );
            gameInstance.setCardsWinnerGameData([]);
            gameInstance.initRoundGameData(gameInstance.getPlayers());
            io.to(data.headers.code).emit('server.canPlayAgain', {});
            let roundLost = [];
            for (player in players) {
                if (!winner.includes(player)) {
                    roundLost.push(player);
                }
            }
            io.to(data.headers.code).emit('server.roundLoosers', {
                roundLoosers: roundLost,
            });
        }
    }
    io.to(data.headers.code).emit('server.playersCards', {
        playersCards: gameInstance.getPlayers(),
    });
    gameInstance.winnerGame(io, socket);
};

module.exports = { onReceiveHandshake, onBatailleStart, playerBatailleSelectedCard };
