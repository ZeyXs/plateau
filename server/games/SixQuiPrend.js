const CardGame = require('./CardGame');

class SixQuiPrend extends CardGame {

    constructor(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat) {
        super(title, size, code, gameType, creatorId, creatorName, gameState, gameData, players, chat);
    }
    /*Créer des mains vides pour chaque joueur */
    createEmptyHand(dict, playerList){
        for (let id in playerList) {
        dict[playerList[id]] = [];
        }
        return dict;
    };
  
    /*Vérifie si tous les joueurs ont la main vide*/
    emptyHand(){
         //A changer
        for (let hand in hands) {
        if (hands[hand].length != 0) {
            return false;
        }
        }
        return true;
    };

    shuffle(pack) {
        for (let i = pack.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pack[i], pack[j]] = [pack[j], pack[i]];
        }
    }
    /*créée paquet de carte en supprimant l'ancien*/
    #createPack() {
        gameData['deck']=[];
        for (var v=1;v<105; v++) {
          gameData['deck'].push(v);
        }
      }

    /*créer le paquet de cartes et les distribue */
    deal(){
        //Plusieurs choses à changer dans la fonction 
        // /!\ NE PAS UTILISER /!\
        this.gameData['lines'] = new Array(4);
        var nbCartesJoueur; //A changer après déboggage
        nbCartesJoueur = 10; //changer nb cartes joueur, test pour fin
        this.createPack(); //A changer
        this.shufflePack();  //A changer
        hands = createEmptyHand(hands, players);  //A changer
        for (let i = 0; i < nbCartesJoueur; i++) {
        for (let player in players) {
            let card = pack.package.pop();
            hands[players[player]].push(card);
        }
        }
        for (var i = 0; i < 4; i++) {
        lines[i] = new Array();
        lines[i].push(pack.package.pop());
        }
    };
    
    /*Supprime une carte dans la main du joueur.*/
    deleteCard(player, card){
         //A changer
        for (let i = 0; i < hands[player].length; i++) {
        if (hands[player][i] == card) {
            hands[player].splice(i, 1);
        }
        }
    };
    
    /*Fonction utilitaire pour trier les cartes non pas en string mais en integer */
    compareNumbers(a, b) {
        // en a-t-on besoin?
        return a - b;
    }
    
    /*Vérifie si un score a atteint 66 */
    scoreReachedTreshold = () => {
         //A changer
        if (scoreboard == {}) {
        return false;
        }
        for (let i in scoreboard) {
        if (scoreboard[i] >= 66) {
            return true;
        }
        }
        return false;
    };
    
    /*Vérifie les conditions d'arrêt */
    stopConditions(){
        return this.emptyHand() && this.scoreReachedTreshold();
    };
    
    /*Renvoie les têtes de liste */
    getHeadLists(list){
        var heads = [];
        for (let i in list) {
        var len = list[i].length;
        heads.push(list[i][len - 1]);
        }
        return heads;
    };
    
    /*Regarde s'il existe un tableau vide dans un dictionnaire*/
    // ?????
    // pk?
    emptyTabExists(array){
        for (player in array) {
        if (array[player].length == 0) {
            return true;
        }
        }
        return false;
    };
    
    /*Calcule le nombre de points de la carte donnée en paramètre*/
    numberOfPoints(v){
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
    };
    
    /*Renvoie s'il existe une tête de liste inférieure à la carte donnée en paramètre*/
    #inferiorTo(list, card){
        for (el in list) {
        if (list[el] < card) return true;
        }
        return false;
    };
    
    /*Créer classement*/
    makeHeadboard(){
        let ranking = new Array();
        let scores = new Array();
        for (let score in scoreboard) {
        scores.push(scoreboard[score]);
        }
        scores.sort(compareNumbers);
        for (let i = 0; i < Object.keys(players).length; i++) {
        let player = getKeyByValue(scoreboard, scores[0]);
        ranking.push([player, scores[0]]);
        scores.shift();
        delete scoreboard[player];
        }
        return ranking;
    };
    
    /*Renvoie l'index de la carte la plus proche mais inférieure à la carte donnée.*/
    getClosestLineHead(card, headList) {
        var max;
        for (let i in headList) {
        if (headList[i] < card) {
            if (typeof max === "undefined" || headList[i] > max) {
            max = headList[i];
            }
        }
        }
        return headList.indexOf(max);
    };
    
    #getKeyByValue(object, value) {
        return Object.keys(object).find((key) => object[key] == value);
    };
    
    /*Récupère les cartes jouées à ce tour et les ordonne*/
    #getSortedCards() {
        let cards = new Array();
        for (let player in round) {
        cards.push(round[player]);
        }
        cards.sort(compareNumbers);
        return cards;
    };
    
    /*Initialise un round*/
    //
    //A bouger, ce n'est pas l'endroit pour cette fonction!!
    //
    InitializeRound() {
        deal();
        for (let player in players) {
        currentPlayer = players[player];
        let hand = hands[currentPlayer];
        io.to(player).emit("main", hand, lines);
        }
        // a changer
        round = createEmptyHand(round, players);
    };
}

module.exports = SixQuiPrend;