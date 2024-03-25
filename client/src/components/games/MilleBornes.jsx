import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useSocket from "../../hooks/useSocket";
import useGame from "../../hooks/useGame";
import { useNavigate } from "react-router-dom";

import WaveFooter from '../../assets/wave-footer.svg';
import Cards from "./Cards";

const CARD_TYPES = {
    BOTTES: "BOTTES",
    ATTAQUES: "ATTAQUES",
    PARADES: "PARADES",
    BORNES: "BORNES"
}

const VALUES_TO_CAT = {
    "VEHICULE_PRIORITAIRE": CARD_TYPES.BOTTES,
    "CITERNE_D_ESSENCE": CARD_TYPES.BOTTES,
    "INCREVABLE": CARD_TYPES.BOTTES,
    "AS_DU_VOLANT": CARD_TYPES.BOTTES,
    "FEU_ROUGE": CARD_TYPES.ATTAQUES,
    "LIMITE_DE_VITESSE": CARD_TYPES.ATTAQUES,
    "PANNE_D_ESSENCE": CARD_TYPES.ATTAQUES,
    "CREVAISON": CARD_TYPES.ATTAQUES,
    "ACCIDENT": CARD_TYPES.ATTAQUES,
    "FEU_VERT": CARD_TYPES.PARADES,
    "FIN_DE_LIMITATION_DE_VITESSE": CARD_TYPES.PARADES,
    "ESSENCE": CARD_TYPES.PARADES,
    "ROUE_DE_SECOURS": CARD_TYPES.PARADES,
    "REPARATION": CARD_TYPES.PARADES,
    "KM25": CARD_TYPES.BORNES,
    "KM50": CARD_TYPES.BORNES,
    "KM75": CARD_TYPES.BORNES,
    "KM100": CARD_TYPES.BORNES,
    "KM200": CARD_TYPES.BORNES
}

const MilleBornes = () => {

    const navigate = useNavigate();

    // _____ Utilisation de contextes _____
    const { auth } = useAuth();
    const socket = useSocket();
    const {
        code,
        gameTitle,
        setGameTitle,
        gameType,
        setGameType,
        gameState,
        setGameState,
        chat,
        setChat,
        players,
        playerNumber,
        setPlayerNumber,
        emit
    } = useGame();

    // _____ Variables de jeu _____
    const [hand, setHand] = useState([]);
    const [bonus, setBonus] = useState([]);
    const [malus, setMalus] = useState([]);
    const [needsGreenLight, setNeedsGreenLight] = useState(true);
    const [scoreboard, setScoreboard] = useState({});
    const [trash, setTrash] = useState([]);
    const [playersData, setPlayersData] = useState({});
    const [rounds, setRounds] = useState(0);
    const [canPlay, setCanPlay] = useState(false);
    const [selectedCard, setSelectedCard] = useState();
    const [selectedPlayer, setSelectedPlayer] = useState();

    // _____ Fonctions de jeu _____
    const onNewTurn = (playerId) => {
        if(auth.id == playerId) {
            setCanPlay(true);
        }
    }

    const playCard = (action, targetId=undefined) => {
        if(canPlay) {
            emit("client.playedCard", {
                selectedCard: selectedCard,
                action: action,
                targetId: targetId
            });
            setSelectedCard(hand[0].value);
            setSelectedPlayer(Object.keys(playersData)[0]);
        }
        setCanPlay(false);
    }

    // _____ Listeners Socket _____
    useEffect(() => {

        socket.on("server.startGame", () => {
            console.log("Received 'client.start'");
        });

        socket.on("server.updateScoreboard", (scoreboard) => {
            setScoreboard(scoreboard);
        });

        socket.on("server.sendHand", (hand) => {
            setHand(hand);
        });

        socket.on("server.sendGameData", (data) => {

            console.log("server.sendGameData");
            console.log(data);

            const sHand = data.hand;
            const sPlayersData = data.playersData;
            const sScoreboard = data.scoreboard;
            const sRounds = data.rounds;
            const sTrash = data.trash;
            setHand(sHand);
            setBonus(sPlayersData[auth.id].bonus);
            setMalus(sPlayersData[auth.id].malus);
            setNeedsGreenLight(sPlayersData[auth.id].needsGreenLight);
            setPlayersData(sPlayersData);
            setScoreboard(sScoreboard);
            setRounds(sRounds);
            setTrash(sTrash);
            setSelectedCard(sHand[0].value);
            setSelectedPlayer(Object.keys(sPlayersData).filter(playerId => playerId != auth.id)[0]);
        });

        socket.on("server.newTurn", (data) => {

            console.log("server.newTurn");
            console.log(data);

            const sAction = data.action;
            const sAffectedPlayer = data.affectedPlayer;
            const sCardValue = data.cardValue;
            const sPlayersData = data.playersData;
            const sTrash = data.trash;
            const sScoreboard = data.scoreboard;
            const sRounds = data.rounds;
            const sNextPlayer = data.nextPlayer;

            setBonus(sPlayersData[auth.id].bonus);
            setMalus(sPlayersData[auth.id].malus);
            setNeedsGreenLight(sPlayersData[auth.id].needsGreenLight);
            setPlayersData(sPlayersData);
            setTrash(sTrash);
            setScoreboard(sScoreboard);
            setRounds(sRounds);
            setSelectedPlayer(Object.keys(sPlayersData).filter(playerId => playerId != auth.id)[0]);
            // Mise-à-jour graphique
            if(sAction == "USE") {
                // < JOUER ANIMATION ? >
            }
            onNewTurn(sNextPlayer);
        });

        socket.on("server.gameEnded", (data) => {
            console.log("server.gameEnded");
            console.log(data);
            const sWinner = data.winner;
            const sFinalScoreboard = data.finalScoreboard;
            alert("Winner: " + sWinner + "\n" + JSON.stringify(sFinalScoreboard));
            navigate("/", { replace: true });
        });

        socket.on("server.leveledUp", (data) => {
            console.log("server.leveledUp");
            console.log(data);
            const sNewLevel = data.newLevel;
            alert("You are now level " + sNewLevel + "!");
        });

        return () => {
            socket.off("server.startGame");
            socket.off("server.updateScoreboard");
            socket.off("server.sendHand");
            socket.off("server.sendGameData");
            socket.off("server.newTurn");
            socket.off("server.gameEnded");
            socket.off("server.leveledUp");
        };

    }, [socket]);

    return (
        <>
        <Cards texture="FEU_VERT" />
        <img src={WaveFooter} className="fixed -bottom-10 left-0 w-full -z-10 select-none" alt="WaveFooter"/>
        {/*<div className="bg-white text-black">
            <div>
                <p>Votre main :</p>
                <select id='card_select' value={selectedCard} onChange={() => setSelectedCard(document.getElementById("card_select").value)}>
                    {hand.map(card => <option value={card.value}>{card.value}</option>)}
                </select>
                {VALUES_TO_CAT[selectedCard] === CARD_TYPES.ATTAQUES ? 
                    <>
                        <select id='player_select' value={selectedPlayer} onChange={() => setSelectedPlayer(document.getElementById("player_select").value)}>
                            {Object.keys(playersData).filter(playerId => playerId != auth.id).map(playerId => <option value={playerId}>{players[playerId].username}</option>)}
                        </select>
                    </>
                : <></>}
                {canPlay ?
                    <>
                        <br/>
                        <button onClick={() => playCard("USE", selectedPlayer)}>Jouer</button>
                        <button onClick={() => playCard("DISCARD")}>Défausser</button>
                    </> : <></>
                }
            </div>
            <div className="bg-[#1a7526]">
                <p>Bottes Actives :</p>
                <ul>
                    {bonus.map(bonus => <li>{bonus}</li>)}
                </ul>
            </div>
            <div className="bg-[#9b2626]">
                <p>Attaques actives :</p>
                <ul>
                    {malus.map(malus => <li>{malus}</li>)}
                </ul>
            </div>
            <div className="bg-[#45345f]">
                <p>Scoreboard :</p>
                <ul>
                    {Object.keys(scoreboard).map(playerId => <li>{players[playerId].username}: {scoreboard[playerId]}</li>)}
                </ul>
            </div>

            <p>Nécessite un feu vert ? : {needsGreenLight ? "oui" : "non"}</p>
            <p>Défausse : {trash.length != 0 ? trash[trash.length-1].value : "vide"}</p>
            <p>Round: {rounds}</p>
        
        </div>*/}
        </>
    );
};

export default MilleBornes;
