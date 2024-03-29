const Game = require('../models/Game');
const CardGame = require('./CardGame');
const { addXpTo } = require('../config/xpFunctions');
const { addVictoryTo, addLossTo } = require('../config/statsFunctions');

const CARD_TYPES = {
    BOTTES: "BOTTES",
    ATTAQUES: "ATTAQUES",
    PARADES: "PARADES",
    BORNES: "BORNES"
}

const CARD_VALUES = {
    VEHICULE_PRIORITAIRE: "VEHICULE_PRIORITAIRE",
    CITERNE_D_ESSENCE: "CITERNE_D_ESSENCE",
    INCREVABLE: "INCREVABLE",
    AS_DU_VOLANT: "AS_DU_VOLANT",
    FEU_ROUGE: "FEU_ROUGE",
    LIMITE_DE_VITESSE: "LIMITE_DE_VITESSE",
    PANNE_D_ESSENCE: "PANNE_D_ESSENCE",
    CREVAISON: "CREVAISON",
    ACCIDENT: "ACCIDENT",
    FEU_VERT: "FEU_VERT",
    FIN_DE_LIMITATION_DE_VITESSE: "FIN_DE_LIMITATION_DE_VITESSE",
    ESSENCE: "ESSENCE",
    ROUE_DE_SECOURS: "ROUE_DE_SECOURS",
    REPARATION: "REPARATION",
    KM25: "KM25",
    KM50: "KM50",
    KM75: "KM75",
    KM100: "KM100",
    KM200: "KM200"
}

const BOTTES_PROTECTION = {
    [CARD_VALUES.VEHICULE_PRIORITAIRE]: [CARD_VALUES.FEU_ROUGE, CARD_VALUES.LIMITE_DE_VITESSE],
    [CARD_VALUES.CITERNE_D_ESSENCE]: [CARD_VALUES.PANNE_D_ESSENCE],
    [CARD_VALUES.INCREVABLE]: [CARD_VALUES.CREVAISON],
    [CARD_VALUES.AS_DU_VOLANT]: [CARD_VALUES.ACCIDENT]
}

const PARADE_CLEAR = {
    [CARD_VALUES.FEU_VERT]: CARD_VALUES.FEU_ROUGE,
    [CARD_VALUES.FIN_DE_LIMITATION_DE_VITESSE]: CARD_VALUES.LIMITE_DE_VITESSE,
    [CARD_VALUES.ESSENCE]: CARD_VALUES.PANNE_D_ESSENCE,
    [CARD_VALUES.ROUE_DE_SECOURS]: CARD_VALUES.CREVAISON,
    [CARD_VALUES.REPARATION]: CARD_VALUES.ACCIDENT
}

const BORNES_TO_VALUE = {
    [CARD_VALUES.KM25]: 25,
    [CARD_VALUES.KM50]: 50,
    [CARD_VALUES.KM75]: 75,
    [CARD_VALUES.KM100]: 100,
    [CARD_VALUES.KM200]: 200,
}

const VALUES_TO_CAT = {
    [CARD_VALUES.VEHICULE_PRIORITAIRE]: CARD_TYPES.BOTTES,
    [CARD_VALUES.CITERNE_D_ESSENCE]: CARD_TYPES.BOTTES,
    [CARD_VALUES.INCREVABLE]: CARD_TYPES.BOTTES,
    [CARD_VALUES.AS_DU_VOLANT]: CARD_TYPES.BOTTES,
    [CARD_VALUES.FEU_ROUGE]: CARD_TYPES.ATTAQUES,
    [CARD_VALUES.LIMITE_DE_VITESSE]: CARD_TYPES.ATTAQUES,
    [CARD_VALUES.PANNE_D_ESSENCE]: CARD_TYPES.ATTAQUES,
    [CARD_VALUES.CREVAISON]: CARD_TYPES.ATTAQUES,
    [CARD_VALUES.ACCIDENT]: CARD_TYPES.ATTAQUES,
    [CARD_VALUES.FEU_VERT]: CARD_TYPES.PARADES,
    [CARD_VALUES.FIN_DE_LIMITATION_DE_VITESSE]: CARD_TYPES.PARADES,
    [CARD_VALUES.ESSENCE]: CARD_TYPES.PARADES,
    [CARD_VALUES.ROUE_DE_SECOURS]: CARD_TYPES.PARADES,
    [CARD_VALUES.REPARATION]: CARD_TYPES.PARADES,
    [CARD_VALUES.KM25]: CARD_TYPES.BORNES,
    [CARD_VALUES.KM50]: CARD_TYPES.BORNES,
    [CARD_VALUES.KM75]: CARD_TYPES.BORNES,
    [CARD_VALUES.KM100]: CARD_TYPES.BORNES,
    [CARD_VALUES.KM200]: CARD_TYPES.BORNES
}


class MilleBornes extends CardGame {

    // __________ Attribut(s) __________

    static CARDS_PER_PLAYER = 6;
    static SCORE_TO_WIN = 300;

    // __________ Constructeur(s) __________

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate) {
        super(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat, isPrivate);
    }

    // __________ Méthode(s) __________

    async start(io) {
        //console.log("-> Starting", this.code);

        // Initialisation des données de la partie
        this.gameData.rounds = 0;
        this.gameData.playerPointer = -1;
        this.gameData.deck = [];
        this.gameData.trash = [];
        this.gameData.winner = undefined;
        this.gameData.finalScoreboard = {};
        for(playerId of Object.keys(this.players)) {
            this.players[playerId] = {
                hand: [],
                bonus: [],
                malus: [CARD_VALUES.FEU_ROUGE],
                score: 0,
            };
        }
        this.gameState = "IN_GAME";
        this.#initDeck();
        this.#dealCards();

        // Avertissement des joueurs du début de la partie
        io.to(this.code).emit('server.startGame');

        // Envoi des informations aux différents clients
        for(let playerId of Object.keys(this.players)) {
            //console.log("Send data to ", playerId);
            this.#sendAllDataTo(io, playerId, false);
        }

        // Début du round suivant
        this.#triggerNextRound(io, false);

        // Mise-à-jour de la base de données
        await Game.findOneAndUpdate({ code: this.code }, { gameState: "IN_GAME" });
    }

    #sendAllHands(io) { // UNUSED
        for(playerId of Object.keys(this.players)) {
            this.#sendHandToPlayer(io, playerId);
        }
    }

    #shuffleDeck() {
        for(let i = this.gameData.deck.length - 1; i > 0; i--) { 
            let j = Math.floor(Math.random() * (i + 1)); 
            [this.gameData.deck[i], this.gameData.deck[j]] = [this.gameData.deck[j], this.gameData.deck[i]]; 
        }
    }

    #initDeck() {
        // _____ Bottes _____
        this.gameData.deck.push({ type: CARD_TYPES.BOTTES, value: CARD_VALUES.VEHICULE_PRIORITAIRE });
        this.gameData.deck.push({ type: CARD_TYPES.BOTTES, value: CARD_VALUES.CITERNE_D_ESSENCE });
        this.gameData.deck.push({ type: CARD_TYPES.BOTTES, value: CARD_VALUES.INCREVABLE });
        this.gameData.deck.push({ type: CARD_TYPES.BOTTES, value: CARD_VALUES.AS_DU_VOLANT });
        // _____ Attaques _____
        for(let i=0; i<5; i++) this.gameData.deck.push({ type: CARD_TYPES.ATTAQUES, value: CARD_VALUES.FEU_ROUGE });
        for(let i=0; i<4; i++) this.gameData.deck.push({ type: CARD_TYPES.ATTAQUES, value: CARD_VALUES.LIMITE_DE_VITESSE });
        for(let i=0; i<3; i++) this.gameData.deck.push({ type: CARD_TYPES.ATTAQUES, value: CARD_VALUES.PANNE_D_ESSENCE });
        for(let i=0; i<3; i++) this.gameData.deck.push({ type: CARD_TYPES.ATTAQUES, value: CARD_VALUES.CREVAISON });
        for(let i=0; i<3; i++) this.gameData.deck.push({ type: CARD_TYPES.ATTAQUES, value: CARD_VALUES.ACCIDENT });
        // _____ Parades _____
        for(let i=0; i<14; i++) this.gameData.deck.push({ type: CARD_TYPES.PARADES, value: CARD_VALUES.FEU_VERT });
        for(let i=0; i<6; i++) this.gameData.deck.push({ type: CARD_TYPES.PARADES, value: CARD_VALUES.FIN_DE_LIMITATION_DE_VITESSE });
        for(let i=0; i<6; i++) this.gameData.deck.push({ type: CARD_TYPES.PARADES, value: CARD_VALUES.ESSENCE });
        for(let i=0; i<6; i++) this.gameData.deck.push({ type: CARD_TYPES.PARADES, value: CARD_VALUES.ROUE_DE_SECOURS });
        for(let i=0; i<6; i++) this.gameData.deck.push({ type: CARD_TYPES.PARADES, value: CARD_VALUES.REPARATION });
        // _____ Bornes _____
        for(let i=0; i<10; i++) this.gameData.deck.push({ type: CARD_TYPES.BORNES, value: CARD_VALUES.KM25 });
        for(let i=0; i<10; i++) this.gameData.deck.push({ type: CARD_TYPES.BORNES, value: CARD_VALUES.KM50 });
        for(let i=0; i<10; i++) this.gameData.deck.push({ type: CARD_TYPES.BORNES, value: CARD_VALUES.KM75 });
        for(let i=0; i<12; i++) this.gameData.deck.push({ type: CARD_TYPES.BORNES, value: CARD_VALUES.KM100 });
        for(let i=0; i<4; i++) this.gameData.deck.push({ type: CARD_TYPES.BORNES, value: CARD_VALUES.KM200 });
        // Shuffle
        this.#shuffleDeck();
    }


    #dealCards() { // Remarque: "deal" signifie "distribuer"
        for(let playerId of Object.keys(this.players)) {
            for(let i = 0; i < MilleBornes.CARDS_PER_PLAYER; i++) {
                let card = this.gameData.deck.pop();
                this.players[playerId].hand.push(card);
            }
        }
    }

    #getScoreboard() {
        let scoreboard = {};
        for(let playerId of Object.keys(this.players)) {
            scoreboard[playerId] = this.players[playerId].score;
        }
        return scoreboard;
    }

    #updateScoreboard(io) { // UNUSED
        const scoreboard = this.#getScoreboard();
        io.to(this.code).emit('server.updateScoreboard', scoreboard);
    }

    getCurrentPlayerId() {
        return Object.keys(this.players)[this.gameData.playerPointer];
    }


    playCard(io, attackerId, selectedCard, action, targetId=undefined) {

        //console.log("playCard(",attackerId, selectedCard, action, targetId,")");

        /*
        - attackerId: l'id du joueur jouant la carte
        - selectedCard: la VALEUR de la carte en question
        - action: OBLIGATOIREMENT "USE" ou "DISCARD"
        - targetId: l'id du joueur concerné par l'attaque (si card.type=CARD_TYPES.ATTAQUES)
        */

        let willReplay = false;
        const cardValue = CARD_VALUES[selectedCard];
        const cardType = VALUES_TO_CAT[cardValue];
        const card = { type: cardType, value: cardValue };

        /*
        console.log("--------------");
        console.log(cardValue);
        console.log(cardType);
        console.log(card);
        console.log(attackerId, action, card, "(target:", targetId, ")");*/

        // Suppression de la carte du joueur dans sa main
        let playerHand = this.players[attackerId].hand;
        for(let i in playerHand) {
            if(JSON.stringify(card) == JSON.stringify(playerHand[i])) {
                playerHand = playerHand.splice(i, 1); 
            }
        }
        this.#sendHandToPlayer(io, attackerId);

        
        // Gestion de l'effet de la carte
        //console.log(action);
        //console.log(action === "USE");
        //console.log(cardType);
        let affectedPlayer = undefined;
        let playerMalus = undefined;
        if(action === "USE") {
            switch(cardType) {
                case CARD_TYPES.BOTTES:
                    this.players[attackerId].bonus.push(cardValue);
                    playerMalus = this.players[attackerId].malus;
                    for(let attaqueToRemove of BOTTES_PROTECTION[cardValue]) {
                        let indAttaque = playerMalus.indexOf(attaqueToRemove);
                        if(indAttaque != -1) playerMalus = playerMalus.splice(indAttaque, 1);
                    }
                    willReplay = true;
                    affectedPlayer = attackerId;
                    break;
                case CARD_TYPES.ATTAQUES:
                    let isImmuned = false;
                    for(let botte of this.players[targetId].bonus) {
                        if(BOTTES_PROTECTION[botte].includes(cardValue)) {
                            isImmuned = true;
                            break;
                        }
                    }
                    if(!isImmuned && !this.players[targetId].malus.includes(cardValue)) {
                        this.players[targetId].malus.push(cardValue);
                        affectedPlayer = targetId;
                    }
                    break;
                case CARD_TYPES.PARADES:
                    playerMalus = this.players[attackerId].malus;
                    for(let i in playerMalus) {
                        if(playerMalus[i] === PARADE_CLEAR[cardValue]) {
                            playerMalus = playerMalus.splice(i, 1);
                            break;
                        }
                    }
                    affectedPlayer = attackerId;
                    break;
                case CARD_TYPES.BORNES:
                    if(!(this.players[attackerId].score + BORNES_TO_VALUE[cardValue] > MilleBornes.SCORE_TO_WIN)) {
                        if(this.players[attackerId].malus.length > 0) {
                            if(this.players[attackerId].malus.includes(CARD_VALUES.LIMITE_DE_VITESSE)) if(BORNES_TO_VALUE[cardValue] > 50) this.players[attackerId].score += 50;
                        }
                        else this.players[attackerId].score += BORNES_TO_VALUE[cardValue];
                        if(this.players[attackerId].score == MilleBornes.SCORE_TO_WIN) {
                            this.#win(io, attackerId); break;
                        };
                    }
                    affectedPlayer = attackerId;
                    break;
            }
            if(cardType != CARD_TYPES.BOTTES) this.gameData.trash.push(card);
        } else {
            this.gameData.trash.push(card);
        }
        
        if(this.gameState != "ENDED") {
            console.log("------------- TRIGGERNEXTROUND -------------");
            this.#triggerNextRound(io, action, affectedPlayer, cardValue, willReplay);
        }
    }


    async #win(io, winnerId) {
        console.log("WWWWWWWWWWWWWWWWWWWWWWWWIIIIIIIIIIIIIINNNNNNNNNNNNNNN");
        // Modification du statut de la partie et mise-à-jour de la base de données
        this.gameState = "ENDED";
        this.gameData.winner = winnerId;
        this.gameData.finalScoreboard = this.#getScoreboard();
        await this.save();

        // Envoi des résultats finaux aux différents clients
        let result = await addXpTo(winnerId, 5);
        io.to(this.code).emit("server.gameEnded", {
            winner: winnerId,
            finalScoreboard: this.gameData.finalScoreboard,
            newLevel: result[0] ? result[1] : undefined,
        });

        // Modification des stats du joueur
        await addVictoryTo(winnerId, "milleBornes");
        for(let playerId of Object.keys(this.players)) {
            if(playerId != winnerId) addLossTo(playerId, "milleBornes");
        }

    }

    #drawCard(playerId) {
        if(this.gameData.deck.length == 0) {
            this.gameData.deck = this.gameData.trash;
            this.#shuffleDeck();
        }
        const card = this.gameData.deck.pop();
        this.players[playerId].hand.push(card);
    }

    #triggerNextRound(io, action, affectedPlayer, cardValue, willReplay) {

        //console.log(this.#getScoreboard());

        // Incrémentation du round/pointeur puis sélection du joueur
        this.gameData.rounds++;
        if(!willReplay) this.gameData.playerPointer++;
        if(this.gameData.playerPointer >= Object.keys(this.players).length) this.gameData.playerPointer = 0;
        const nextPlayer = Object.keys(this.players)[this.gameData.playerPointer];

        // Le joueur pioche
        this.#drawCard(nextPlayer);
        this.#sendHandToPlayer(io, nextPlayer);

        // Puis on renvoie l'état du round actuel
        /* Remarque: On copie les données de players pour éviter de modifier l'original */
        let playersData = JSON.parse(JSON.stringify(this.players));
        for(playerId of Object.keys(playersData)) delete playersData[playerId].hand;    
        io.to(this.code).emit('server.newTurn', {
            action: action,
            affectedPlayer: affectedPlayer,
            cardValue: cardValue,
            playersData: playersData,
            trash: this.gameData.trash,
            scoreboard: this.#getScoreboard(),
            rounds: this.gameData.rounds,
            nextPlayer: nextPlayer
        });
    }



    

    rejoin(io, userId) {
        // Objectif: Renvoyer au client les données relatives au joueur et à la partie
        console.log("AAAAAAAAAAAAAAAAAAAAAA");
        setTimeout(() => this.#sendAllDataTo(io, userId, true), 200);
    }

    #sendAllDataTo(io, userId, recallPlayer) {

        //console.log(userId);

        // Récupération du socket
        const socketId = this.socketIds[userId];

        //console.log(socketId);

        const socket = io.sockets.sockets.get(socketId);

        //console.log(socket);

        // Récupération de la main du joueur
        const hand = this.players[userId].hand;

        // Données des joueurs (sans leur main)
        const playersCopy = JSON.parse(JSON.stringify(this.players));
        for(let playerId of Object.keys(playersCopy)) delete playersCopy[playerId].hand;
        
        // Emission des données au client
        socket.emit("server.sendGameData", {
            hand: hand,
            playersData: playersCopy,
            scoreboard: this.#getScoreboard(),
            rounds: this.gameData.rounds,
            trash: this.gameData.trash,
            nextPlayer: recallPlayer ? Object.keys(this.players)[this.gameData.playerPointer] : ""
        });

        console.log("Data sent to", userId);
    }



    #sendHandToPlayer(io, playerId) {
        //console.log("Sent hand to", playerId);
        const socketId = this.socketIds[playerId];
        const playerHand = this.players[playerId].hand;
        const socket = io.sockets.sockets.get(socketId);
        console.log('server.sendHand', playerHand);
        socket.emit('server.sendHand', playerHand);
    }


    getPlayerHand(playerId) {
        return this.players[playerId].hand;
    }




}

module.exports = MilleBornes;