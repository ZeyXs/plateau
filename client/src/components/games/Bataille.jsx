import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import useAuth from '../../hooks/useAuth';
import useGame from '../../hooks/useGame';
import useSocket from '../../hooks/useSocket';
import Cards from './Cards';

const Bataille = () => {
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
        playerNumber,
        setPlayerNumber,
        players,
        setPlayers,
        size,
        emit,
    } = useGame();

    const [canPlay, setCanPlay] = useState(true);
    const [selectedCard, setSelectedCard] = useState();
    const [roundOtherCardPlayed, setRoundOtherCardPlayed] = useState({});

    const [roundState, setRoundState] = useState('');
    const [numberRound, setNumberRound] = useState(1);

    const [hand, setHand] = useState([]);
    const [trash, setTrash] = useState([]);

    const [othersCards, setOthersCards] = useState({});
    const [othersTrashes, setOthersTrashes] = useState({});

    const [leaderboard, setLeaderboard] = useState(false);

    const [gameLoosers, setGameLoosers] = useState([]);
    const [gameWinner, setGameWinner] = useState("");

    const [playButtonDisabled, setPlayButtonDisabled] = useState(true);
    const [logs, setLogs] = useState([]);
    const [playedCards, setPlayedCards] = useState({});
    const [hasPlayed, setHasPlayed] = useState(false);
    const [displayCard, setDisplayCard] = useState(false);
    const [inBataille, setInBataille] = useState(false);
    const [showWinPopup, setShowWinPopup] = useState(false);


    const updateHasPlayed = (delay) => {
        let newPlayedCards = Object.assign({}, playedCards);
        for (let playerId of Object.keys(players)) {
            newPlayedCards[playerId] = {
                hasPlayed: false,
                visibleCardPlayed: undefined,
                hiddenCard: undefined,
            }
        }

        setTimeout(() => {
            setPlayedCards(newPlayedCards);
            setInBataille(false);
            setDisplayCard(false);
        }, delay);
    }

    const hasPlayedToFalse = () => {
        let newPlayedCards = Object.assign({}, playedCards);
        for (let playerId of Object.keys(players)) {
            newPlayedCards[playerId].hasPlayed = false;
        }
        setPlayedCards(newPlayedCards);
    }

    useEffect(() => {

        socket.on('server.playerData', (data) => {
            addCards(data.infos)
            let newPlayedCards = {};
            for (let playerId of Object.keys(players)) {
                newPlayedCards[playerId] = {
                    hasPlayed: false,
                    visibleCardPlayed: undefined,
                    hiddenCard: undefined,
                }
            }
            setPlayedCards(newPlayedCards);
            //setDisplayCard(false)
        });

        socket.on('server.canPlayAgain', (data) => {
            if (data.loosers.includes(auth.id)) {
                setTimeout(() => {
                    setCanPlay(true);
                    setHasPlayed(false);
                }, 2000)
            }
        });

        socket.on('server.roundWinners', (data) => {
            for (let roundWinner of data.roundWinners) {
                if (roundWinner == auth.id) {
                    deleteAllDic(roundOtherCardPlayed);
                    setLogs(prev => [...prev, `Tu as gagné au tour N°${numberRound} !`]);
                    setNumberRound(prevNumberRound => prevNumberRound + 1);
                }
            }
            updateHasPlayed(2000);
        });

        socket.on('server.roundLoosers', (data) => {
            for (let roundLooser of data.roundLoosers) {
                if (roundLooser == auth.id) {
                    deleteAllDic(roundOtherCardPlayed);
                    setLogs(prev => [...prev, `Tu as perdu au tour N°${numberRound} !`]);
                    setNumberRound(prevNumberRound => prevNumberRound + 1);
                }
            }
            updateHasPlayed(2000);
        });

        socket.on('server.equality', (data) => {
            if (auth.id == data.user) {
                hasPlayedToFalse();
                setDisplayCard(false);
                setInBataille(true);
                addCards(data.userCards)
                setCanPlay(true);
            }
        });

        socket.on("server.isEquality", (data) => {
            let playersEquality = [];
            for (let playerEquality of data.playersEquality) {
                playersEquality.push(players[playerEquality].username);
            }
            const res = "Il y a une bataille entre " + playersEquality.join(" et ");
            setLogs(prev => [...prev, res]);
            setHasPlayed(false);
        })

        socket.on('server.otherCardPlayed', (data) => {
            let newPlayedCards = Object.assign({}, playedCards);
            newPlayedCards[data.user].visibleCardPlayed = data.userCard;
            newPlayedCards[data.user].hasPlayed = true;
            setPlayedCards(newPlayedCards);
            // check if everyone hasPlayed
            let allPlayed = true;
            for (let playerId of Object.keys(players)) {
                if (!playedCards[playerId].hasPlayed) {
                    allPlayed = false;
                }
            }

            setDisplayCard(false);
            if (!allPlayed) return;
            setTimeout(() => setDisplayCard(true), 200);
        });

        socket.on('server.sendHiddenCard', (data) => {
            let newPlayedCards = Object.assign({}, playedCards);
            newPlayedCards[data.user].hiddenCard = data.userCard;
            setPlayedCards(newPlayedCards);
        });

        socket.on('server.playersCards', (data) => {
        });

        socket.on('server.gameLoosers', (data) => {
            if (data.gameLoosers.length > 0) {
                setGameLoosers(data.gameLoosers);
            }
        });

        socket.on('server.gameLeaderboard', (data) => {
            setLeaderboard(true);
            setCanPlay(false);
            setGameWinner(data.gameWinner);
            setGameLoosers(data.gameLoosers);
            setShowWinPopup(true);
        })

        return () => {
            socket.off('server.playerData');
            socket.off('server.canPlayAgain');
            socket.off('server.roundWinners');
            socket.off('server.roundLoosers');
            socket.off('server.equality');
            socket.off('server.isEquality');
            socket.off('server.sendHiddenCard');
            socket.off('server.otherCardPlayed');
            socket.off('server.playersCards');
            socket.off('server.gameLoosers');
            socket.off('server.gameLeaderboard');
        }

    }, [socket, hand, selectedCard, playedCards, trash, gameWinner, gameLoosers, leaderboard, roundOtherCardPlayed, numberRound, auth.id, players, displayCard, inBataille, canPlay, hasPlayed, logs]);

    const deleteAllDic = (dico) => {
        Object.keys(dico).forEach(key => delete dico[key]);
    };

    const showCard = (card) => {
        let values = {
            2: 'Deux',
            3: 'Trois',
            4: 'Quatre',
            5: 'Cinq',
            6: 'Six',
            7: 'Sept',
            8: 'Huit',
            9: 'Neuf',
            10: 'Dix',
            11: 'Valet',
            12: 'Dame',
            13: 'Roi',
            14: 'As',
        };
        return values[card.value] + ' de ' + card.color;
    };

    const filenameCard = (card) => {
        return "b_" + showCard(card).replace(" de ", "_").replace(" ", "_").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const addCards = (cards) => {
        setHand(cards);
    };

    const playCard = () => {
        if (canPlay && selectedCard) {
            emit('client.selectedCard', { card: selectedCard });
            setCanPlay(false);
            setPlayButtonDisabled(true);
            setHand(prevHand => prevHand.filter(card => showCard(card) !== selectedCard));
            setSelectedCard(undefined);
            setHasPlayed(true);
        }
    };

    const handleSelectedCard = (card) => {
        if (showCard(card) !== selectedCard && !hasPlayed) {
            setSelectedCard(showCard(card))
            setPlayButtonDisabled(false)
        } else {
            setSelectedCard(undefined)
            setPlayButtonDisabled(true)
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden select-none">
            {/*showWinPopup ? <PlayerWinPopup winner={gameWinner} finalScoreboard={finalScoreboard} newLevel={false} /> : ""*/}
            <div className="relative flex-1 flex flex-row items-center justify-center">
                <div className="absolute top-0">
                    <div className="mr-5 flex flex-row items-start space-x-8 border-gray-400 border-4 rounded-xl p-4 scale-75">
                        {playedCards !== undefined && Object.keys(playedCards).map((player, i) => (
                            <div key={i} className="flex flex-col space-y-4 items-center justify-center">
                                <div className={`relative flex flex-col items-center justify-center space-y-2 p-1 rounded-lg`}>
                                    {/*currentBest === player ? <span className="absolute rotate-[-37deg] bottom-[7.2rem] right-[3.8rem]" ><GiQueenCrown size={40} color="#ffca44" /></span> : ""*/} 
                                    <div className=" bg-gray-400 rounded-full flex items-center justify-center">
                                        <img src={players[player].profilePicture} className="w-[70px] h-[70px] border-gray-300 border-2 rounded-full object-cover" />
                                    </div>
                                    <div className="flex flex-col bg-[#27273c] min-w-[100px] -space-x-1 rounded-lg text-center">
                                        <span className="text-lg">{players[player].username}</span>
                                        <span className="text-lg font-bold">{leaderboard[player]}</span>
                                    </div>
                                </div>
                                <div className="relative h-[7rem] right-9">
                                    {(playedCards[player].hasPlayed && !inBataille) && 
                                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className={`absolute top-0 left-0 w-[5rem] h-[7rem]`}>
                                            <Cards type={displayCard ? filenameCard(playedCards[player].visibleCardPlayed) : "b_dos_carte_b"} width="32" height="44" />
                                        </motion.div>
                                    }
                                    {inBataille && (
                                        <>
                                            <motion.div initial={{ y: -50, opacity: 0, rotate: 0 }} animate={{ y: 0, opacity: 1, rotate: 90 }} transition={{ duration: 0.5, delay: 0.5 }} className="absolute top-0 left-0 w-[5rem] h-[7rem]">
                                                <Cards type="b_dos_carte_b" width="32" height="44" />
                                            </motion.div>
                                            {playedCards[player].hasPlayed && <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="absolute top-0 left-0 w-[5rem] h-[7rem]">
                                                <Cards type={displayCard ? filenameCard(playedCards[player].visibleCardPlayed) : "b_dos_carte_b"} width="32" height="44" />
                                            </motion.div>}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='flex flex-col space-y-2 mt-32 items-center justify-center'>
                    {logs.map((log, i) => (
                        <motion.div
                        key={i}
                        className={`text-lg ${i === logs.length - 1 ? "font-bold" : ""}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1 - (logs.length - i - 1) * 0.3, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                        {log}
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="flex flex-row justify-evenly">
                <div className="overflow-x-auto flex scale-90 -space-x-8 items-center border-dashed border-4 p-4 rounded-lg max-w-[100vh]">
                    <div className="flex -space-x-8 pr-1">
                        {hand.map((card, i) => {
                            const cardType = "b_" + showCard(card).replace(" de ", "_").replace(" ", "_").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                            return (
                                <div
                                    key={i}
                                    className={`cursor-pointer w-[8rem] h-[11rem] hover:scale-105 hover:z-40 transition ease-in-out ${selectedCard === showCard(card) ? "hover:scale-110 scale-110 z-50" : ""}`}
                                    onClick={() => handleSelectedCard(card)}
                                >
                                    <Cards type={cardType} width="32" height="44" disabled={hasPlayed} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center">
                    <button onClick={playCard} className="bg-[#7fb352] hover:bg-[#93cc60] disabled:bg-[#8e8e8e] p-2 px-3 rounded-lg text-2xl transition ease-in-out" disabled={playButtonDisabled} >Jouer</button>
                </div>
            </div>
            {/*<div className="bg-white text-black">
                {canPlay && !leaderboard &&
                    <select
                        id="selected-card"
                        onChange={event => {
                            setSelectedCard(event.target.value);
                        }}
                        value={selectedCard}>
                        {hand.map(card => {
                            return (
                                <option
                                    key={showCard(card)}
                                    value={showCard(card)}>
                                    {showCard(card)}
                                </option>
                            );
                        })}
                    </select>
                }
                {canPlay && !leaderboard && (
                    <button id="jouer-carte" onClick={playCard}>
                        Jouer la carte
                    </button>
                )}
                {<p>Ceci est le tour numéro {numberRound}.</p>}
                {!leaderboard && <p>{roundState}</p>}
                {gameWinner != "" ? (<div>Le gagnant est : {players[gameWinner].username}.</div>) : ("")}
                {gameLoosers.length > 0 ? (<div> Les perdants sont :
                    {gameLoosers.map((looser, i) => {
                        return <p key={i}>{players[looser].username}</p>
                    })}
                </div>) : ("")}
                {(Object.keys(roundOtherCardPlayed).map((p, j) => (
                    <div key={j}>
                        <p>
                            <b>
                                Joueur {players[p].username} a joué{' '}
                                {roundOtherCardPlayed[p].length} cartes.
                            </b>
                        </p>
                        <ul>
                            {roundOtherCardPlayed[p].map((card, index) => (
                                <li key={index}>{card}</li>
                            ))}
                        </ul>
                    </div>
                )))}
                {(Object.keys(othersCards).map((p, j) => (
                    <div key={j}>
                        <p>
                            <b>
                                Joueur {players[p].username} a{' '}
                                {othersCards[p].length + othersTrashes[p].length} cartes dont {othersTrashes[p].length} dans sa défausse.
                            </b>
                        </p>
                    </div>
                )))}
                </div>*/}
        </div>
    );
};

export default Bataille;