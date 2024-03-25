const CardGame = require('./CardGame');
const Pack = require('./utils/Pack');

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

    start() {
        this.gameData['round'] = {};
        this.gameData['cardsToSendWinner'] = [];
		this.initRoundGameData(this.players);
    }

    getRoundGameData() {
        return this.gameData['round'];
    }

    getCardsWinnerGameData() {
        return this.gameData['cardsToSendWinner'];
    }

    setCardsWinnerGameData(cards) {
        this.gameData['cardsToSendWinner'] = cards;
    }

    setRoundGameData(player, card) {
        this.gameData['round'][player] = card;
    }

    initRoundGameData(listPlayers) {
        this.gameData['round'] = {};
        for (let player in listPlayers) {
            this.gameData['round'][player] = [];
        }
    }

    createEmptyHand(players_list) {
        let dict = {};
        for (let id in players_list) {
            dict[players_list[id]] = [];
        }
        return dict;
    }

    deal(io) {
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

        

        //console.log(socketId);


        //console.log(socket);

        // Récupération de la main du joueur
		
        for (let playerId in this.players) {
			const socketId = this.socketIds[playerId];
			const socket = io.sockets.sockets.get(socketId);
			
			console.log("[server.playerData] playerId: " + playerId + " socketId: " + socketId);
			socket.emit('server.playerData', {
                infos: this.players[playerId],
            });
        };
    }

    stringToCard(str) {
        let values = {
            As: 1,
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
        for (let player in round) {
            cards.push(round[player]);
        }
    }

    roundWinner() {
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

    emptyTabExists(array) {
        for (let player in array) {
            if (array[player].length == 0) {
                return true;
            }
        }
        return false;
    }

    getListPlayersToReplay(winners) {
        let playersToReplay = {};
        let players = this.getPlayers();
        for (let player in players) {
            if (winners.includes(player)) {
                playersToReplay[player] = players[player];
            }
        }
        return playersToReplay;
    }

    askHiddenCard(playersToken, io) {
        let players = this.getPlayers();
        for (let player in playersToken) {
            const randomCard =
                players[player].hand[
                    Math.floor(Math.random() * players[player].hand.length)
                ];
            this.setCardsWinnerGameData(
                this.getCardsWinnerGameData().concat(randomCard),
            );

            this.deleteCard(player, randomCard);
            io.to(this.code).emit('server.otherCardPlayed', {
                user: player,
                userCard: randomCard,
            });
            io.to(this.code).emit('server.equality', {
                user: player,
                userRandomCard: randomCard,
            });
        }
    }

    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] == value);
    }

    winnerGame(io) {
        let winners = [];
        for (let player in this.players) {
            if (this.players[player].hand.length === 51) {
                winners.push(player);
                looseGame(winners, io);
            }
        }
        io.to(this.code).emit('server.gameWinners', { gameWinners: winners });
    }

    looseGame(winners, io) {
        let loosers = [];
        for (let player in this.players) {
            if (!winners.includes(player)) {
                loosers.push(player);
            }
        }
        io.to(this.code).emit('server.gameLoosers', { gameLoosers: loosers });
    }
}

module.exports = Bataille;
