import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiQueenCrown } from "react-icons/gi";

import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import useGame from '../../hooks/useGame';

import Cards from './Cards';
import PlayerSelectLine from './PlayerSelectLine';
import PlayerWinPopup from './PlayerWinPopup';


const SixQuiPrend = () => {

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
        emit,
    } = useGame();

    // _____ Variables de jeu _____
    const [hand, setHand] = useState([]);
    const [canPlay, setCanPlay] = useState(true);
    const [playButtonDisabled, setPlayButtonDisabled] = useState(true);
    const [selectedCard, setSelectedCard] = useState(undefined);
    const [lines, setLines] = useState([]);
    const [playersData, setPlayersData] = useState({});
    const [canSelectLine, setCanSelectLine] = useState(false);
    const [scoreboard, setScoreboard] = useState({});

    const [showWinPopup, setShowWinPopup] = useState(false);
    const [winner, setWinner] = useState("");
    const [finalScoreboard, setFinalScoreboard] = useState({});
    const [newLevel, setNewLevel] = useState();

    const [currentBest, setCurrentBest] = useState();
    const [playerPlayed, setPlayerPlayed] = useState([]);

    // Tout ce qui est en dessous est à modifier et à vérifier

    const handleSelectedCard = (card) => {
        console.log("Selected card: " + card);
        if (selectedCard === card) {
            // On désélectionne la carte
            setPlayButtonDisabled(true);
            setSelectedCard(undefined);
        } else if (canPlay) {
            // On sélectionne la carte
            setPlayButtonDisabled(false);
            setSelectedCard(card);
        } else {
            // On sélectionne la carte mais il ne peut pas jouer
            setPlayButtonDisabled(true);
            setSelectedCard(card);
        }
    };

    const updateCurrentBest = (scoreboard) => {
        const scoresAreZero = Object.values(scoreboard).every(score => score === 0);
        if (!scoresAreZero) {
            const bestPlayer = Object.keys(scoreboard).reduce((a, b) => scoreboard[a] < scoreboard[b] ? a : b);
            setCurrentBest(bestPlayer);
        }
    };

    useEffect(() => {
        console.log('Prêt à recevoir des socket');

        socket.on('server.sendHand', data => {
            console.log('Receiving data...');
            setHand(data.hand);
            console.log('Data to start game received.');
        });

        socket.on('server.canPlayAgain', lines => {
            console.log('Receiving can play again signal...');
            console.log(lines);
            setLines(lines);
            if (!selectedCard) {
                setSelectedCard(undefined);
                setPlayButtonDisabled(true);
            }
            setCanPlay(true);
        });

        socket.on('server.cardsPlayed', hands => {
            console.log('Server send cards played this round');
            let handsList = {};
            for (let p in hands) {
                handsList[p] = hands[p];
            }
        });

        socket.on('server.requestToBuyALine', data => {
            console.log('Server request to select a line to buy...');
            console.log(data);
            const sLines = data.lines;
            setLines(sLines);
            setCanSelectLine(true);
        });

        socket.on('server.scoreboardChanged', newScoreboard => {
            console.log('Scoreboard updated.');
            console.log(newScoreboard);
            setScoreboard(newScoreboard);
            updateCurrentBest(newScoreboard);
        });

        socket.on('server.someonePlayed', data => {
            const playerId = data.playerId;
            console.log(players[playerId].username + " played a card. Waiting for all players to play.");
        });

        // A changer
        socket.on('server.sendGameData', data => {
            console.log('server.sendGameData');
            console.log(data);
            const sHand = data.hand;
            const sPlayersData = data.playersData;
            const sScoreboard = data.scoreboard;
            const sLines = data.lines;
            const sCanPlay = data.canPlay;
            const sCanSelectLine= data.canSelectLine;
            setCanPlay(sCanPlay);
            setHand(sHand);
            setLines(sLines);
            setPlayersData(sPlayersData);
            setScoreboard(sScoreboard);
            setCanSelectLine(sCanSelectLine);
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

        return () => {
            socket.off('server.startGame');
            socket.off('server.scoreboardChanged');
            socket.off('server.sendHand');
            socket.off('server.sendGameData');
            socket.off('server.canPlayAgain');
            socket.off('server.gameEnded');
            socket.off('server.leveledUp');
        };

    }, [socket]);

    const deleteCard = card => {
        console.log('Deletion of cards');
        //console.log(hand);
        var cards = hand;
        for (let i in hand) {
            //console.log("On est dans la boucle",card,cards[card],i);
            if (card == cards[i]) {
                //console.log(cards[i]);
                cards.splice(i, 1);
                //console.log("cards after deletion",cards);
                setHand(cards);
            }
        }
        console.log(hand);
    };

    const playCard = () => {
        if (canPlay) {
            //var cardToSend=selectedCard;
            console.log('Sending card:', selectedCard, 'to server');
            deleteCard(selectedCard);
            emit('client.playedCard', {
                card: parseInt(selectedCard),
            });
        }
        setCanPlay(false);
        setPlayButtonDisabled(true);
    };

    const sendLine = (lineIndex) => {
        if (canSelectLine) {
            emit('client.lineBought', { lineNumber: lineIndex });
            setCanSelectLine(false);
            console.log('Line selected send to server');
        }
    };

    // Le select des lignes ne fonctionne pas, à réparer
    return (
        <>
            <div className="flex flex-col h-full overflow-hidden select-none">
                {showWinPopup ? <PlayerWinPopup winner={winner} finalScoreboard={finalScoreboard} newLevel={newLevel} /> : ""}
                <div className="relative flex-1 flex flex-row items-center justify-between">
                    <div className="flex flex-col space-y-4 ml-8">
                        {lines.map((line, i) => (
                            <div key={i} onClick={() => sendLine(i)} className={`flex flex-row space-x-2 p-1 ${canSelectLine ? "border-2 cursor-pointer hover:border-amber-400 rounded-lg" : ""}`}>
                                 {line.map((card, index) => (
                                    <div key={index} className="w-[75px] h-[105px]">
                                        <Cards type={`CARD_${card}`} width="[75px]" height="[105px]" />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="mr-5 flex flex-col items-start space-y-4 border-gray-400 border-4 rounded-xl p-4 scale-75">
                        {Object.keys(players).map((player, i) => (
                            <div key={i} className={`relative flex flex-col items-center justify-center space-y-2 border-4 border-[#eeeeee00] p-1 hover:border-yellow-500 hover:border-4 rounded-lg`}>
                                {currentBest === player ? <span className="absolute rotate-[-37deg] bottom-[7.2rem] right-[3.8rem]" ><GiQueenCrown size={40} color="#ffca44" /></span> : ""} 
                                <div className=" bg-gray-400 rounded-full flex items-center justify-center">
                                    <img src={players[player].profilePicture} className="w-[70px] h-[70px] border-gray-300 border-2 rounded-full object-cover" />
                                </div>
                                <div className="flex flex-col bg-[#27273c] min-w-[100px] -space-x-1 rounded-lg text-center">
                                    <span className="text-lg">{players[player].username}</span>
                                    <span className="text-lg font-bold">{scoreboard[player]}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                <div className="flex flex-row justify-evenly lg:scale-100 md:scale-75">
                    <div className={`flex flex-row scale-90 -space-x-12 items-center justify-center border-dashed border-4 p-2 rounded-lg`}>
                        {hand.map((card, i) => (
                            <div
                                key={i}
                                onClick={() => handleSelectedCard(card)}
                                className={`cursor-pointer w-[8rem] h-[11rem] hover:scale-105 hover:z-40 transition ease-in-out ${selectedCard === card ? "hover:scale-110 scale-110 z-50" : ""}`}
                                >
                                <Cards type={`CARD_${card}`} width="32" height="44" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center">
                        <button onClick={playCard} className="bg-[#7fb352] hover:bg-[#93cc60] disabled:bg-[#8e8e8e] p-2 px-3 rounded-lg text-2xl transition ease-in-out" disabled={playButtonDisabled} >Jouer</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SixQuiPrend;