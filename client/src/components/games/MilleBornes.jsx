import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCircle } from "react-icons/fa";
import { GiQueenCrown } from "react-icons/gi";

import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import useGame from '../../hooks/useGame';

import Cards from './Cards';
import Popover from '../utils/Popover';
import PlayerInfo from './PlayerInfo';
import PlayerAttackPopup from './PlayerAttackPopup';
import PlayerWinPopup from './PlayerWinPopup';

const CARD_TYPES = {
    BOTTES: 'BOTTES',
    ATTAQUES: 'ATTAQUES',
    PARADES: 'PARADES',
    BORNES: 'BORNES',
};

const PARADE_CLEAR = {
    "FEU_ROUGE": "FEU_VERT",
    "LIMITE_DE_VITESSE": "FIN_DE_LIMITATION_DE_VITESSE",
    "PANNE_D_ESSENCE": "ESSENCE",
    "CREVAISON": "ROUE_DE_SECOURS",
    "ACCIDENT": "REPARATION",
};

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
        emit,
    } = useGame();

    // _____ Refs _____
    const playerCardRefs = useRef([]);
    const centerRef = useRef(null); 
    const centerCoords = useRef({ x: 0, y: 0 });

    // _____ Variables de jeu _____
    const [hand, setHand] = useState([]);
    const [bonus, setBonus] = useState([]);
    const [malus, setMalus] = useState([]);
    const [scoreboard, setScoreboard] = useState({});
    const [trash, setTrash] = useState([]);
    const [playersData, setPlayersData] = useState({});
    const [rounds, setRounds] = useState(0);
    const [canPlay, setCanPlay] = useState(false);
    const [canThrow, setCanThrow] = useState(false);
    const [selectedCard, setSelectedCard] = useState();
    const [selectedCardValue, setSelectedCardValue] = useState();
    const [selectedPlayer, setSelectedPlayer] = useState();
    const [slots, setSlots] = useState(Array(8).fill(undefined));
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState();
    const [currentBest, setCurrentBest] = useState();
    const [showAttackPopup, setShowAttackPopup] = useState(false);

    const [showWinPopup, setShowWinPopup] = useState(false);
    const [winner, setWinner] = useState("");
    const [finalScoreboard, setFinalScoreboard] = useState({});
    const [newLevel, setNewLevel] = useState();

    const [attacks, setAttacks] = useState({
        'FEU_ROUGE': false,
        'LIMITE_DE_VITESSE': false,
        'PANNE_D_ESSENCE': false,
        'CREVAISON': false,
        'ACCIDENT': false,
    });
    const [bonuses, setBonuses] = useState({
        'AS_DU_VOLANT': false,
        'INCREVABLE': false,
        'CITERNE_D_ESSENCE': false,
        'VEHICULE_PRIORITAIRE': false,
    });

    const playCard = (action, targetId = undefined) => {
        if (currentPlayerTurn === auth.id) {
            if (hand[selectedCard].type !== 'ATTAQUES' || action === 'DISCARD') {
                emit('client.playedCard', {
                    selectedCard: selectedCardValue,
                    action: action,
                    targetId: targetId,
                });
            } else {
                //setSelectedPlayer(Object.keys(playersData)[0]);
                setShowAttackPopup(true);
            }
        }
        setSelectedCard(undefined);
        setSelectedCardValue(undefined);
        setCanPlay(false);
        setCanThrow(false);
    };

    const handleSelectedCard = (selectedCardIndex) => {
        console.log("Selected card: " + hand[selectedCardIndex].value);
        if (selectedCard === selectedCardIndex) {
            // On désélectionne la carte
            handleHand(hand); 
            setCanThrow(false);
            setCanPlay(false);
            setSelectedCard(undefined);
            setSelectedCardValue(undefined);
        } else {
            // On sélectionne la carte
            setCanPlay(false);
            setSelectedCard(selectedCardIndex);
            setSelectedCardValue(hand[selectedCardIndex].value);
            const updatedHand = hand.map((card, i) => ({
                ...card,
                disabled: (selectedCardIndex || selectedCardIndex === 0) ? i !== selectedCardIndex : false
            }));

            if (hand[selectedCardIndex].type === 'BOTTES') {
                setCanPlay(true);
            } else if (malus.length > 0 && !malus.includes('LIMITE_DE_VITESSE')) {
                if (hand[selectedCardIndex].type === 'PARADES') {
                    malus.forEach(malusCard => {
                        if (hand[selectedCardIndex].value === PARADE_CLEAR[malusCard]) {
                            console.log("Carte parade correspondante trouvée")
                            setCanPlay(true);
                        }
                    });
                }
            } else if (hand[selectedCardIndex].type === 'BORNES' || hand[selectedCardIndex].type === 'ATTAQUES') {
                setCanPlay(true);
            }
            
            setHand(updatedHand);
            setCanThrow(true);
        }
    };

    const handleHand = (hand) => {
        const updatedHand = hand.map((card) => ({
            ...card,
            disabled: false,
        }));
        setHand(updatedHand);
    };

    const updateAttacksAndBonuses = (playersData) => {
        const newAttacks = {};
        Object.keys(attacks).forEach(cardValue => {
            newAttacks[cardValue] = playersData[auth.id].malus.includes(cardValue);
        });
        setAttacks(newAttacks);
        const newBonuses = {};
        Object.keys(bonuses).forEach(cardValue => {
            newBonuses[cardValue] = playersData[auth.id].bonus.includes(cardValue);
        });
        setBonuses(newBonuses);
    };

    const updateCurrentBest = (scoreboard) => {
        const scoresAreZero = Object.values(scoreboard).every(score => score === 0);
        if (!scoresAreZero) {
            const bestPlayer = Object.keys(scoreboard).reduce((a, b) => scoreboard[a] > scoreboard[b] ? a : b);
            setCurrentBest(bestPlayer);
        }
    };

    // _____ Listeners Socket _____
    useEffect(() => {

        socket.on('server.startGame', () => {
            console.log("Received 'client.start'");
        });

        socket.on('server.updateScoreboard', scoreboard => {
            console.log('server.updateScoreboard', scoreboard);
            setScoreboard(scoreboard);
        });

        socket.on('server.sendHand', hand => {
            console.log('Main reçue du serveur', hand);
            handleHand(hand);
        });

        socket.on('server.sendGameData', data => {
            console.log('server.sendGameData');
            console.log(data);

            const sHand = data.hand;
            const sPlayersData = data.playersData;
            const sScoreboard = data.scoreboard;
            const sRounds = data.rounds;
            const sTrash = data.trash;
            const sNextPlayer = data.nextPlayer;
            handleHand(sHand);
            setBonus(sPlayersData[auth.id].bonus);
            setMalus(sPlayersData[auth.id].malus);
            console.log(sPlayersData)
            setPlayersData(sPlayersData);
            setScoreboard(sScoreboard);
            setRounds(sRounds);
            setTrash(sTrash);
            setCurrentPlayerTurn(sNextPlayer);
            setSelectedPlayer(
                Object.keys(sPlayersData).filter(
                    playerId => playerId != auth.id,
                )[0],
            );
            setCanPlay(false);
            setCanThrow(false);
            
            updateAttacksAndBonuses(sPlayersData);
            updateCurrentBest(sScoreboard);
        });

        socket.on('server.newTurn', data => {
            console.log('server.newTurn');
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
            setPlayersData(sPlayersData);
            setTrash(sTrash);
            setScoreboard(sScoreboard);
            setRounds(sRounds);
            setCurrentPlayerTurn(sNextPlayer);
            setSelectedPlayer(
                Object.keys(sPlayersData).filter(
                    playerId => playerId != auth.id,
                )[0],
            );
            // Mise-à-jour graphique   sAction === 'DISCARD'
            if (sAction == 'USE') {
                // < JOUER ANIMATION ? >
            }
            
            updateAttacksAndBonuses(sPlayersData);
            updateCurrentBest(sScoreboard);
        });

        socket.on('server.gameEnded', data => {
            console.log('server.gameEnded');
            console.log(data);
            const sWinner = data.winner;
            const sFinalScoreboard = data.finalScoreboard;
            const sNewLevel = data.newLevel;
            setWinner(sWinner);
            setFinalScoreboard(sFinalScoreboard);
            setNewLevel(sNewLevel);
            setShowWinPopup(true);
        });

        socket.on('server.leveledUp', data => {
            console.log('server.leveledUp');
            console.log(data);
            const sNewLevel = data.newLevel;
            alert('You are now level ' + sNewLevel + '!');
        });

        return () => {
            socket.off('server.startGame');
            socket.off('server.updateScoreboard');
            socket.off('server.sendHand');
            socket.off('server.sendGameData');
            socket.off('server.newTurn');
            socket.off('server.gameEnded');
            socket.off('server.leveledUp');
        };
    }, [socket]);

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden select-none">
                {showAttackPopup ? <PlayerAttackPopup cardValue={selectedCardValue} playersData={playersData} setShowAttackPopup={setShowAttackPopup} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} setCanPlay={setCanPlay} setCanThrow={setCanThrow} /> : ""}
                {showWinPopup ? <PlayerWinPopup winner={winner} finalScoreboard={finalScoreboard} newLevel={newLevel} /> : ""}
                <div className="relative flex-1 flex flex-row items-center justify-center">
                    <div className="absolute left-5 flex flex-col items-start space-y-4 border-gray-400 border-4 rounded-xl p-4 scale-75">
                    {Object.keys(players).map((player, i) => (
                        <Popover key={i} content={<PlayerInfo playerId={player} playersData={playersData} attacks={attacks} bonuses={bonuses} />} >
                            <div className={`relative flex flex-col items-center justify-center space-y-2 border-4 border-[#eeeeee00] p-1 hover:border-yellow-500 hover:border-4 rounded-lg ${currentPlayerTurn !== player ? "opacity-50" : ""}`}>
                                {currentBest === player ? <span className="absolute rotate-[-37deg] bottom-[7.2rem] right-[3.8rem]" ><GiQueenCrown size={40} color="#ffca44" /></span> : ""} 
                                <div className=" bg-gray-400 rounded-full flex items-center justify-center">
                                    <img src={players[player].profilePicture} className="w-[70px] h-[70px] border-gray-300 border-2 rounded-full object-cover" />
                                </div>
                                <div className="flex flex-col bg-[#27273c] min-w-[100px] -space-x-1 rounded-lg text-center">
                                    <span className="text-lg">{players[player].username}</span>
                                    <span className="text-lg font-bold">{scoreboard[player]}</span>
                                </div>
                            </div>
                        </Popover>
                    ))}
                    </div>
                    
                    <div className="h-[150px] w-[220px] border-4 border-dashed border-gray-400 rounded-lg flex flex-row p-2 items-center justify-center space-x-5 scale-125">
                        <div ref={centerRef} className=' w-[75px] h-[105px] border-gray-400 border-2 rounded-lg'>
                            <Cards type={trash.length > 0 ? trash[trash.length - 1].value : ""} width="[65px]" height="[90px]" />
                        </div>
                        <div className="w-[75px] h-[105px] opacity-75">
                            <Cards type="DOS_CARTE" width="[75px]" height="[105px]" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-between ">
                    <div className="flex flex-col justify-center rounded-lg p-2">
                        <div className="flex flex-row items-center">
                            <span className="mr-2">
                                <FaCircle size={16} color="red" />
                            </span>
                            <span className="text-lg">Attaques reçues</span>
                        </div>
                        <div className="flex flex-row space-x-2">
                            {Object.keys(attacks).map((card, i) => (
                                <div key={i} className="w-[50px] h-[68px] border-gray-400 border-2 rounded-lg border-dotted">
                                    <Cards type={card} width="[48px]" height="[72px]" disabled={!attacks[card]} />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-row items-center">
                            <span className="mr-2">
                                <FaCircle size={16} color="lightgreen" />
                            </span>
                            <span className="text-lg">Bottes actives</span>
                        </div>
                        <div className="flex flex-row space-x-2">
                            {Object.keys(bonuses).map((card, i) => (
                                <div key={i} className="w-[50px] h-[68px] border-gray-400 border-2 rounded-lg border-dotted">
                                    <Cards type={card} width="[48px]" height="[72px]" disabled={!bonuses[card]} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`flex flex-row scale-90 -space-x-6 items-center justify-center ${currentPlayerTurn === auth.id ? "border-green-400" : "border-gray-300"} border-dashed border-4 p-2 rounded-lg`}>
                        {hand.map((card, i) => (
                            <div
                                key={i}
                                className={`cursor-pointer w-[8rem] h-[11rem] hover:scale-105 hover:z-40 transition ease-in-out ${selectedCard === i ? "hover:scale-110 scale-110 z-50" : ""}`}
                                onClick={() => handleSelectedCard(i)}>
                                <Cards type={card.value} width="32" height="44" disabled={card.disabled} />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                        <button onClick={() => playCard("USE", selectedPlayer)} className="bg-[#7fb352] hover:bg-[#93cc60] disabled:bg-[#8e8e8e] p-2 px-3 rounded-lg text-2xl transition ease-in-out" disabled={!canPlay || currentPlayerTurn !== auth.id} >Jouer</button>
                        <button onClick={() => playCard("DISCARD")} className="bg-[#c62d2d] hover:bg-[#e25454] disabled:bg-[#686868] p-2 px-3 rounded-lg text-2xl transition ease-in-out" disabled={!canThrow || currentPlayerTurn !== auth.id} >Défausser</button>
                    </div>
                    <div></div>
                </div>
            </div>
        </>
    );
};

export default MilleBornes;