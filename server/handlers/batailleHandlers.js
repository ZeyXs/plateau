// C'est ici que l'on envoie les informations propre à chaque joueur car on répond
// seulement au socket de l'émetteur et non à tous les sockets de la room.

const { off } = require("../models/Game");

// ⚠️ C'est donc ici que ce passe le vrai lancement de la partie.
const onReceiveHandshake = (io, socket, data, gameInstance) => {
  /*console.log("onReceiveHandshake")
    const userId = data.headers.senderId;
    socket.emit('server.playerData', {
        infos: gameInstance.getPlayers()[userId],
    });*/
};

const onBatailleStart = async (io, socket, data, gameInstance) => {
  //Fonction de lancement de partie
  console.log("onGameStart");
  const code = data.headers.code;
  io.to(code).emit("server.requestHandshake");
  setTimeout(() => gameInstance.deal(io), 100);
};

/*
const changeTrash = async (io, socket, data, gameInstance) => {
  await gameInstance.trashToHand(data.headers.senderId, io);
  io.to(data.headers.code).emit("server.playersCards", {
    //On envoie les cartes de tout le monde à tout le monde
    playersCards: gameInstance.getPlayers(),
  });
};
*/
const playerBatailleSelectedCard = async (io, socket, data, gameInstance) => {
  //Déroulement de chaque round
  const code = data.headers.code;
  const userId = data.headers.senderId;
  const card = gameInstance.stringToCard(data.body.card);
  gameInstance.setRoundGameData(userId, card);
  gameInstance.deleteCard(userId, card);
  gameInstance.winnerGame(io);
  io.to(code).emit("server.otherCardPlayed", {
    user: userId,
    userCard: card,
  });

  gameInstance.noHandButTrash();

  if (!gameInstance.emptyListExists(gameInstance.getRoundGameData())) {
    //On attend que tous les joueurs aient envoyé leur carte
    gameInstance.cardsToWinner(
      //On récupère les cartes à envoyer au gagnant
      gameInstance.getCardsWinnerGameData(),
      gameInstance.getRoundGameData()
    );
    let winner = gameInstance.roundWinner(); //On récupère le.s gagnant.s.

    if (winner.length > 1) {
      //Cas d'une bataille
      let listPlayersToReplay = gameInstance.getListPlayersToReplay(winner); //On récupère les joueuers à faire rejouer (les gagnants)
      let notReplaying = []; //Variable qui stocke ceux qui ne perdent pas dans cette égalité

      for (player of listPlayersToReplay) {
        notReplaying.push(player);
        let hand = gameInstance.getPlayers()[player].hand;
        let trash = gameInstance.getTrashGameData()[player];

        if (hand.length < 2 && trash.length > 1) {
          //Dans le cas où le joueur à moins de 2 cartes(donc il ne peut pas faire la bataille), et qu'il y a des cartes dans la défausse du joueur
          gameInstance.trashToHand(player);
        } else if (hand.length < 2 && trash.length == 0) {
          //Dans le cas où la joueur à moins de 2 cartes et qu'il n'y a pas de cartes dans la défausse du joueur : le joueur perd.
          gameInstance.setCardsWinnerGameData(
            //On ajoute les cartes au gagnant
            gameInstance.getCardsWinnerGameData().concat(hand)
          );
          gameInstance.setHandPlayer(player, []); //on set la main du joueur vide (il a perdu)
          listPlayersToReplay = listPlayersToReplay.filter((p) => p !== player); //on supprime le joueur dans ceux à rejouer.
          notReplaying = notReplaying.filter((p) => p !== player);
        }
      }

      console.log("j'envoie une fois isEquality, enfin normalement")
      io.to(code).emit("server.isEquality", {
        playersEquality: listPlayersToReplay,
      });

      if (listPlayersToReplay.length == 0) {
        //dans le cas ou les joueurs de la bataille ont TOUS plus de cartes, on rajoute tout le monde sauf eux dans ceux à rejour (on fait juste une tour normal ensuite avec les joueurs restants)
        io.to(code).emit("server.canPlayAgain", {
          loosers: gameInstance.hasLoosers(
            Object.keys(gameInstance.getPlayers()),
            io
          ),
        });
        gameInstance.initRoundGameData(notReplaying);
      } else {
        gameInstance.askHiddenCard(listPlayersToReplay, io); //On leur faire tirer une carte aléatoire à poser.
        gameInstance.setRoundGameData({});
        gameInstance.initRoundGameData(
          //On initialise round qui va attend les cartes des gagnants.
          listPlayersToReplay
        );
      }
    } else {
      //Cas sans bataille
      players = gameInstance.getPlayers();

      //roundLost contient les perdants du round
      let roundLost = [];
      for (player in players) {
        if (!winner.includes(player)) {
          roundLost.push(player);
        }
      }

      io.to(code).emit("server.roundLoosers", {
        //on envoie à tous les perdants qu'ils ont perdus côté client
        roundLoosers: roundLost,
      });

      gameInstance.setTrashGameData(
        winner,
        gameInstance.getCardsWinnerGameData()
      );
      gameInstance.noHandButTrash();
      gameInstance.setCardsWinnerGameData([]);

      io.to(code).emit("server.roundWinners", {
        //On envoie au gagnant avec les cartes à ajouter côté client
        roundWinners: winner,
        cards: gameInstance.getCardsWinnerGameData(),
      });

      let playersInGame = gameInstance.hasLoosers(Object.keys(players), io);
      if (playersInGame.length === Object.keys(players).length) {
        io.to(code).emit("server.canPlayAgain", {
          loosers: Object.keys(players),
        });
      } else {
        io.to(code).emit("server.canPlayAgain", { loosers: playersInGame });
      }

      gameInstance.initRoundGameData(
        //On prépare round pour les joueurs restants (sans ceux perdants)
        playersInGame
      );
    }
  }
  io.to(code).emit("server.playersCards", {
    //On envoie les cartes de tout le monde à tout le monde
    playersCards: gameInstance.getPlayers(),
    playersTrashes: gameInstance.getTrashGameData(),
  });
  gameInstance.winnerGame(io, socket);
};

module.exports = {
  onReceiveHandshake,
  onBatailleStart,
  playerBatailleSelectedCard,
};