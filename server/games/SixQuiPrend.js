const { addVictoryTo, addLossTo } = require('../config/statsFunctions');
const { addXpTo } = require('../config/xpFunctions');

const CardGame = require('./CardGame');
const Game = require('../models/Game');

class SixQuiPrend extends CardGame {
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
        this.gameData['round'] = 0;
    }
    async start(io) {
        this.gameData.winner = undefined;
        this.gameData.finalscoreboard = {};
        console.log('Initializing SixQuiPrend......');
        for (let playerId of Object.keys(this.players)) {
            //Initialisation du score à 0.
            this.players[playerId].score = 0;
        }
        this.#InitializeRound(io);

        // Mise-à-jour de la base de données
        this.gameState = 'IN_GAME';
        await Game.findOneAndUpdate({ code: this.code }, { gameState: "IN_GAME" });
    }

    /*Créer des mains vides pour chaque joueur */
    #createEmptyHand() {
        for (let uid in this.players) {
            this.players[uid]['hand'] = [];
        }
    }

    /*Vérifie si tous les joueurs ont la main vide*/
    #emptyHand() {
        for (let player in this.players) {
            if (this.players[player]['hand'].length != 0) {
                return false;
            }
        }
        return true;
    }

    #shuffleDeck() {
        for (let i = this.gameData.deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.gameData.deck[i], this.gameData.deck[j]] = [
                this.gameData.deck[j],
                this.gameData.deck[i],
            ];
        }
    }
    /*créée paquet de carte en supprimant l'ancien*/
    #createDeck() {
        this.gameData['deck'] = [];
        for (var v = 1; v < 105; v++) {
            this.gameData['deck'].push(v);
        }
    }

    /*Initialise un round*/
    #InitializeRound(io) {
        this.gameData.roundNumber += 1;
        this.gameData.lines = new Array(4);
        this.#createDeck();
        this.#shuffleDeck();
        this.#createEmptyHand();
        this.#deal();
        console.log('SixQuiPrend Initialized.');
        for (let playerId of Object.keys(this.players)) {
            this.players[playerId].canPlay = true;
            console.log(this.players);
            this.#sendAllDataTo(io, playerId);
        }
        this.#createRound();
    }

    // - créer espace où stocker les cartes jouées au tour actuel.

    /*créer le paquet de cartes et les distribue */
    #deal() {
        for (let player in this.players) {
            for (let i = 0; i < 10; i++) {
                let card = this.gameData['deck'].pop();
                this.players[player]['hand'].push(card);
            }
        }
        for (var i = 0; i < 4; i++) {
            this.gameData['lines'][i] = new Array();
            this.gameData['lines'][i].push(this.gameData['deck'].pop());
        }
    }

    #sendHandToPlayer(io, playerId) {
        console.log('Sent hand to', playerId);
        const socketId = this.socketIds[playerId];
        const playerHand = this.players[playerId].hand;
        playerHand.sort(function(a, b) {
            return a - b;
        });
        const socket = io.sockets.sockets.get(socketId);
        var res = socket.emit('server.sendHand', {
            hand: playerHand,
        });
        console.log('Send via function.', res);
    }

    #sendAllHands(io) {
        // UNUSED
        for (let playerId of Object.keys(this.players)) {
            console.log('Preparing to send cards to players');
            this.#sendHandToPlayer(io, playerId);
        }
    }

    getLines() {
        return this.gameData['lines'];
    }

    /*Supprime une carte dans la main du joueur.*/
    #deleteCard(player, card) {
        var hand = this.players[player]['hand'];
        console.log(hand);
        for (let i = 0; i < hand.length; i++) {
            if (hand[i] == card) {
                hand.splice(i, 1);
            }
        }
        console.log(hand);
    }

    /*Vérifie si un score a atteint 66 */
    #scoreReachedTreshold = () => {
        //A changer
        for (let player in this.players) {
            if (this.players[player]['score'] >= 66) {
                return true;
            }
        }
        return false;
    };

    /*Vérifie les conditions d'arrêt */
    #stopConditions() {
        return this.#emptyHand() && this.#scoreReachedTreshold();
    }

    #createRound() {
        this.gameData.round = {};
        for (let playerId of Object.keys(this.players)) {
            this.gameData.round[playerId] = 0;
        }
    }

    /*Renvoie les têtes de liste */
    #getHeadLists() {
        var heads = [];
        for (let i in this.gameData['lines']) {
            var len = this.gameData['lines'][i].length;
            heads.push(this.gameData['lines'][i][len - 1]);
        }
        console.log();
        console.log('_________________');
        console.log();
        console.log('Headlist:', heads);
        return heads;
    }

    /*Regarde si tous les joueurs ont sélectionné une carte à jouer.*/
    #everyoneSelectedCard() {
        for (let playerId of Object.keys(this.players)) {
            console.log(
                'player',
                playerId,
                ' card',
                this.gameData.round[playerId],
            );
            if (this.gameData.round[playerId] == 0) {
                return false;
            }
        }
        return true;
    }

    /*Calcule le nombre de points de la carte donnée en paramètre*/
    #numberOfPoints(v) {
        var val = 0;
        if (v % 10 == 0) {
            val += 3;
        } else {
            if (v % 5 == 0) {
                val += 2;
            }
            if (v % 11 == 0) {
                val += 5;
            }
            if (val == 0) {
                val = 1;
            }
        }
        return val;
    }

    /*Renvoie s'il existe une tête de liste inférieure à la carte donnée en paramètre*/
    #inferiorTo(list, card) {
        for (let el in list) {
            if (list[el] < card) return true;
        }
        return false;
    }

    /*Créer classement*/
    #getScoreboard() {
        let scores = {};
        console.log('creation scoreboard');
        for (let player in this.players) {
            scores[player] = this.players[player]['score'];
        }
        console.log(scores);
        return scores;
    }

    /*Renvoie l'index de la carte la plus proche mais inférieure à la carte donnée.*/
    #getClosestLineHead(card, headList) {
        console.log(card, headList);
        var max = 0;
        for (let i in headList) {
            console.log('____Debut tour de boucle_________');
            console.log(headList[i], card, max);
            if (headList[i] < card) {
                if (headList[i] > max) {
                    max = headList[i];
                }
            }
            console.log(headList[i], card, max);
            console.log('_____Fin tour de boucle_____');
        }
        return headList.indexOf(max);
    }

    #getKeyByValue(object, value) {
        console.log(
            "I'm searching for the key in",
            object,
            'that equals to',
            value,
        );
        return Object.keys(object).find(key => object[key] == value);
    }

    /*Récupère les cartes jouées à ce tour et les ordonne*/
    #getSortedCards() {
        let cards = new Array();
        for (let player in this.players) {
            cards.push(this.gameData.round[player]);
        }
        cards.sort((a, b) => a - b);
        return cards;
    }

    /*Tour de jeu, réinitialise les cartes données et envoie aux joueurs qu'ils peuvent rejouer.*/
    #gameRound = (io, cards) => {
        console.log('We can play the cards!');
        while (cards.length != 0) {
            var headList = this.#getHeadLists();
            var lineToModify = this.#getClosestLineHead(cards[0], headList);
            console.log(this.gameData.lines, lineToModify);
            console.log(
                'Adding',
                cards[0],
                'to',
                this.gameData.lines[lineToModify],
            );
            console.log(this.gameData.lines[lineToModify]);
            console.log(this.gameData.lines.length);
            if (this.gameData.lines[lineToModify].length == 5) {
                // A changer
                console.log("It's the Sixth card! The line is done.");
                this.#lineDone(io, cards[0], lineToModify);
            } else {
                this.gameData.lines[lineToModify].push(cards[0]);
            }
            headList[lineToModify] = cards[0];
            cards.shift();
            console.log('Remaining cards to add:', cards);
        }
        console.log("Let's check if the round is done!");
        this.#endRoundOrParty(io);
    };

    /*Envoie aux joueurs les scores actuels */
    #scoreToPlayers = (io, line, player) => {
        var val = 0;
        for (let i in line) {
            val += this.#numberOfPoints(parseInt(line[i]));
        }
        console.log(val);
        this.players[player].score += val;
        // A changer
        io.to(this.code).emit(
            'server.scoreboardChanged',
            this.#getScoreboard(),
        );
        //enregistrer les scores avant de les envoyer au joueur
    };

    /*Pour quand une ligne est achetée ou complétée*/
    #lineDone = (io, card, number) => {
        //A changer
        console.log(this.gameData.lines, card, number);
        let playerId = this.#getKeyByValue(this.gameData.round, card);
        this.#scoreToPlayers(io, this.gameData.lines[number], playerId);
        this.gameData.lines[number] = [];
        this.gameData.lines[number].push(card);
        console.log(this.gameData.lines);
    };

    /*Vérifie si les conditions de fin de partie ou de round sont remplies et 
  exécute la fin de partie ou la création du round suivant*/
    #endRoundOrParty = io => {
        if (this.#stopConditions()) {
            let headboard = this.#getScoreboard();
            var min = 1000;
            var winnerId = '';
            for (let playerId of Object.keys(headboard)) {
                if (headboard[playerId] < min) {
                    min = headboard[playerId];
                    winnerId = playerId;
                }
            }
            this.#win(io, winnerId);
        } else {
            if (this.#emptyHand() && !this.#scoreReachedTreshold()) {
                this.#InitializeRound(io);
            }
            // A changer
            this.#createRound();
            io.to(this.code).emit('server.canPlayAgain', this.gameData.lines);
            for (let playerId of Object.keys(this.players)) {
                this.players[playerId].canPlay = true;
            }
        }
    };

    rejoin(io, userId) {
        // Objectif: Renvoyer au client les données relatives au joueur et à la partie
        console.log('AAAAAAAAAAAAAAAAAAAAAA');
        setTimeout(() => this.#sendAllDataTo(io, userId), 200);
    }

    #sendAllDataTo(io, userId) {
        const socketId = this.socketIds[userId];
        const socket = io.sockets.sockets.get(socketId);

        //console.log(socket);

        // Récupération de la main du joueur
        const hand = this.players[userId].hand;
        hand.sort(function(a, b) {
            return a - b;
        });
        const lines = this.gameData.lines;
        const canPlay = this.players[userId].canPlay;
        // Données des joueurs (sans leur main)
        const playersCopy = JSON.parse(JSON.stringify(this.players));
        for (let playerId of Object.keys(playersCopy))
            delete playersCopy[playerId].hand;

        // Emission des données au client
        socket.emit('server.sendGameData', {
            hand: hand,
            playersData: playersCopy,
            lines: lines,
            canPlay: canPlay,
            scoreboard: this.#getScoreboard(),
            roundNumber: this.gameData.roundNumber,
        });

        console.log('Data sent to', userId);
    }

    async #win(io, winnerId) {
        console.log('Game ended');
        // Modification du statut de la partie et mise-à-jour de la base de données
        this.gameState = 'ENDED';
        this.gameData.winner = winnerId;
        const nonSortedScoreboard = this.#getScoreboard();
        this.gameData.finalScoreboard = Object.fromEntries(Object.entries(nonSortedScoreboard).sort(([,a],[,b]) => a-b));
        await this.save();

        // Envoi des résultats finaux aux différents clients
        const result = await addXpTo(winnerId, 5);
        io.to(this.code).emit('server.gameEnded', {
            winner: winnerId,
            finalScoreboard: this.gameData.finalScoreboard,
            newLevel: result[0] ? result[1] : undefined,
        });

        // Ajout d'XP au gagnant (+ informer celui-ci si level-up)
        /*if(result[0]) {
        const socketId = this.socketIds[winnerId];
        const socket = io.sockets.sockets.get(socketId);
        socket.emit("server.leveledUp", {
            newLevel: result[1]
        });
    }*/
        // Modification des stats du joueur
        await addVictoryTo(winnerId, 'SixQuiPrend');
        for (let playerId of Object.keys(this.players)) {
            if (playerId != winnerId) addLossTo(playerId, 'SixQuiPrend');
        }
    }

    playCard(io, playerId, card, code) {
        console.log(this.gameData.round, card);
        console.log(this.players[playerId]);

        this.players[playerId].canPlay = false;
        this.gameData.round[playerId] = card;
        this.#deleteCard(playerId, card);

        if (this.#everyoneSelectedCard()) {
            console.log('Analyzing the cards played');
            let cards = this.#getSortedCards();
            let headList = this.#getHeadLists();
            if (!this.#inferiorTo(headList, cards[0])) {
                console.log('A player needs to buy a line');
                var playerBying = this.#getKeyByValue(
                    this.gameData.round,
                    cards[0],
                );
                console.log(playerBying);
                const socketId = this.socketIds[playerBying];
                const playerHand = this.players[playerBying].hand;
                const socket = io.sockets.sockets.get(socketId);
                var res = socket.emit('server.requestToBuyALine', {
                    lines: this.gameData.lines,
                });
                console.log('Send request :', res);
            } else {
                this.#gameRound(io, cards);
            }
        } else {
            io.to(code).emit("server.someonePlayed", { playerId: playerId })
        }
    }

    lineBought(io, lineNumber) {
        console.log('Modifying line', lineNumber);
        let cards = this.#getSortedCards();
        this.#lineDone(io, cards[0], lineNumber);
        cards.shift();
        //console.log("___________Line bought__________")
        this.#gameRound(io, cards);
    }
}

module.exports = SixQuiPrend;
