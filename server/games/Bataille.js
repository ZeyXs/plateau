const CardGame = require('./CardGame');
const Pack = require('./utils/Pack');
const Game = require('../models/Game');

class Bataille extends CardGame {
    constructor(
        title,
        size,
        code,
        gameType,
        creatorId,
        creatorName,
        gameState,
        gameData,
        players,
        chat,
        isPrivate,
    ) {
        super(
            title,
            size,
            code,
            gameType,
            creatorId,
            creatorName,
            gameState,
            gameData,
            players,
            chat,
            isPrivate,
        );
    }

    async start() {
        this.gameData['round'] = {};
        this.gameData['trash'] = {};
        this.gameData['cardsToSendWinner'] = [];
        this.initRoundGameData(Object.keys(this.players));
        this.initTrashGameData();

		// Mise-à-jour de la base de données
        this.gameState = 'IN_GAME';
        await Game.findOneAndUpdate({ code: this.code }, { gameState: "IN_GAME" });
    }

    getRoundGameData() {
        return this.gameData['round'];
    }

    getTrashGameData() {
        return this.gameData['trash'];
    }

    getCardsWinnerGameData() {
        return this.gameData['cardsToSendWinner'];
    }

    setHandPlayer(player, hand) {
        this.players[player].hand = hand;
    }

    setCardsWinnerGameData(cards) {
        this.gameData['cardsToSendWinner'] = cards;
    }

    setRoundGameData(player, card) {
        this.gameData['round'][player] = card;
    }

    setTrashGameData(player, cards) {
        console.log(this.gameData['trash'][player]);
        console.log(cards);
        this.gameData['trash'][player] =
            this.gameData['trash'][player].concat(cards);
        /*io.to(this.code).emit("server.trash", {
      playerTrash: player,
      cardsTrash: cards,
    });*/
    }

    initRoundGameData(listPlayers) {
        //Initialise en fonction de listPlayers l'attribut "round"
        //console.log(listPlayers);
        this.gameData['round'] = {};
        for (let player of listPlayers) {
            this.gameData['round'][player] = [];
        }
        //console.log("je", this.gameData["round"]);
    }

    initTrashGameData() {
        this.gameData['trash'] = {};
        for (let player in this.players) {
            this.gameData['trash'][player] = [];
        }
    }

    noHandButTrash(player) {
        for (player in this.players) {
            //on regarder si un joueur à une défausse vide
            if (
                this.players[player].hand.length == 0 &&
                this.getTrashGameData()[player].length > 0
            ) {
                this.trashToHand(player);
            }
        }
    }

    trashToHand(player) {
        this.players[player].hand = this.players[player].hand.concat(
            this.gameData['trash'][player],
        );
        this.players[player].hand.sort((a, b) => a.value - b.value);
        this.gameData['trash'][player] = [];
    }

    deal(io) {
        //Mélange les cartes et envoie à chaque joueurs ses cartes associées.
        this.start();
        let pack = new Pack();
        pack.createPack();
        pack.shufflePack();

        let longueur = pack.package.length;
        for (
            let i = 0;
            i < Math.floor(longueur / Object.keys(this.players).length);
            i++
        ) {
            for (let player in this.players) {
                let card = pack.package.pop();
                this.players[player].hand.push(card);
            }
        }
        for (let player in this.players) {
            if (pack.package.length > 0) {
                let card = pack.package.pop();
                this.players[player].hand.push(card);
            } else {
                break;
            }
        }

        // Récupération de la main du joueur

        for (let playerId in this.players) {
            const socketId = this.socketIds[playerId];
            const socket = io.sockets.sockets.get(socketId);

            console.log(
                '[server.playerData] playerId: ' +
                    playerId +
                    ' socketId: ' +
                    socketId,
            );
            socket.emit('server.playerData', {
                infos: this.players[playerId].hand.sort((a, b) => a.value - b.value),
            });
        }
    }

    stringToCard(str) {
        //Les cartes du côté client en string sont transformées en objet
        let values = {
            Deux: 2,
            Trois: 3,
            Quatre: 4,
            Cinq: 5,
            Six: 6,
            Sept: 7,
            Huit: 8,
            Neuf: 9,
            Dix: 10,
            Valet: 11,
            Dame: 12,
            Roi: 13,
            As: 14,
        };
        str = str.split(' ');
        return { value: values[str[0]], color: str[2] };
    }

    deleteCard(player, card) {
        for (let i = 0; i < this.players[player].hand.length; i++) {
            if (
                this.players[player].hand[i]['value'] == card['value'] &&
                this.players[player].hand[i]['color'] == card['color']
            ) {
                this.players[player].hand.splice(i, 1);
            }
        }
    }

    cardsToWinner(cards, round) {
        //Renvoie les cartes à donner au gagnant
        for (let player in round) {
            cards.push(round[player]);
        }
    }

    roundWinner() {
        //Renvoie les gagnants du round
        let round_winner = [];
        let value_max = 0;
        let round = this.getRoundGameData();
        for (let player in round) {
            let currentCard = round[player]['value'];
            if (currentCard > value_max) {
                round_winner = [player];
                value_max = currentCard;
            } else {
                if (currentCard == value_max) {
                    round_winner.push(player);
                }
            }
        }
        return round_winner;
    }

    emptyListExists(array) {
        //Renvoie true si une valeur est une liste est vide
        for (let player in array) {
            if (array[player].length == 0) {
                return true;
            }
        }
        return false;
    }

    getListPlayersToReplay(winners) {
        //Renvoie les joueurs qui doivent rejouer (en cas d'égalité)
        let playersToReplay = [];
        for (let player in this.players) {
            if (winners.includes(player)) {
                playersToReplay.push(player);
            }
        }
        return playersToReplay;
    }

    askHiddenCard(playersList, io) {
        //Choisi une carte aléatoire pour chaque joueur concerné par une bataille
        let players = this.players;
        for (let player of playersList) {
            let randomCard = [];
            randomCard =
                players[player].hand[
                    Math.floor(Math.random() * players[player].hand.length)
                ];
            this.setCardsWinnerGameData(
                this.getCardsWinnerGameData().concat(randomCard),
            );
            this.deleteCard(player, randomCard);
            io.to(this.code).emit('server.sendHiddenCard', {
                user: player,
                userCard: randomCard,
            });
            io.to(this.code).emit('server.equality', {
                user: player,
                userCards: this.players[player].hand,
            });
        }
    }

    winnerGame(io) {
        for (let player in this.players) {
            if (
                this.players[player].hand.length +
                    this.gameData['trash'][player].length ==
                52
            ) {
                let notLooser = this.hasLoosers([], io);
                let loosers = [];
                for (let player in this.players) {
                    if (!notLooser.includes(player)) {
                        loosers.push(player);
                    }
                }
                io.to(this.code).emit('server.gameLeaderboard', {
                    gameWinner: player,
                    gameLoosers: loosers,
                });
            }
        }
    }

    hasLoosers(list, io) {
        //Renvoie la liste des perdants s'il y en a, sinon list.
        let loosers = [];
        for (let player in this.players) {
            if (
                this.players[player].hand.length == 0 &&
                this.gameData['trash'][player].length == 0
            ) {
                loosers.push(player);
            }
        }

        if (loosers.length > 0) {
            io.to(this.code).emit('server.gameLoosers', {
                gameLoosers: loosers,
            });
            let notLoosers = [];
            for (player in this.players) {
                if (!loosers.includes(player)) {
                    notLoosers.push(player);
                }
            }
            return notLoosers;
        } else {
            return list;
        }
    }
}

module.exports = Bataille;
