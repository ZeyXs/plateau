import useAuth from '../../hooks/useAuth';
import useGame from '../../hooks/useGame';
import useSocket from '../../hooks/useSocket';
import { useState, useEffect } from 'react';
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
    const [selectedCard, setSelectedCard] = useState('');
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

    useEffect(() => {

        socket.on('server.playerData', (data) => {
            addCards(data.infos)
        });

        socket.on('server.canPlayAgain', (data) => {
            if (data.loosers.includes(auth.id)) {
                setCanPlay(true);
            }
        });

        socket.on('server.roundWinners', (data) => {
            for (let roundWinner of data.roundWinners) {
                if (roundWinner == auth.id) {
                    deleteAllDic(roundOtherCardPlayed);
                    setRoundState('Tu as gagné au tour précédent ! ');
                    setNumberRound(prevNumberRound => prevNumberRound + 1);
                }
            }
        });

        socket.on('server.roundLoosers', (data) => {
            for (let roundLooser of data.roundLoosers) {
                if (roundLooser == auth.id) {
                    deleteAllDic(roundOtherCardPlayed);
                    setRoundState('Tu as perdu au tour précédent ! ');
                    setNumberRound(prevNumberRound => prevNumberRound + 1);
                }
            }
        });

        socket.on('server.equality', (data) => {
            if (auth.id == data.user) {
                addCards(data.userCards)
                setCanPlay(true);
            }
        });

        socket.on("server.isEquality", (data) => {
            let res = "Il y a une égalité entre : "
            for (let playerEquality of data.playersEquality) {
                res += players[playerEquality].username + ","
            }
            setRoundState(res)
        })

        socket.on('server.otherCardPlayed', (data) => {
            let dico = roundOtherCardPlayed;
            if (dico.hasOwnProperty(data.user)) {
                dico[data.user].push(showCard(data.userCard));
            } else {
                dico[data.user] = [showCard(data.userCard)];
            }
            setRoundOtherCardPlayed(dico);
        });

        socket.on('server.playersCards', (data) => {
            let handsList = {};
            let trashList = {};
            for (let player in data.playersCards) {
                handsList[player] = data.playersCards[player].hand;
                trashList[player] = data.playersTrashes[player]
                if (player == auth.id) {
                    addCards(data.playersCards[player].hand)
                    setTrash(data.playersTrashes[player]);
                }
            }
            setOthersCards(handsList);
            setOthersTrashes(trashList);
        });

        socket.on('server.gameLoosers', (data) => {
            if (data.gameLoosers.length > 0) {
                setGameLoosers(data.gameLoosers)
            }
        });

        socket.on('server.gameLeaderboard', (data) => {
            setLeaderboard(true)
            setCanPlay(false)
            setGameWinner(data.gameWinner)
            setGameLoosers(data.gameLoosers)
        })

        return () => {
            socket.off('server.playerData');
            socket.off('server.canPlayAgain');
            socket.off('server.roundWinners');
            socket.off('server.roundLoosers');
            socket.off('server.equality');
            socket.off('server.otherCardPlayed');
            socket.off('server.playersCards');
            socket.off('server.gameLoosers');
            socket.off('server.gameLeaderboard');
        }

    }, [socket, hand, selectedCard, trash, gameWinner, gameLoosers]);

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

    const addCards = (cards) => {
        setHand(cards);
    };

    const playCard = () => {
        if (canPlay) {
            emit('client.selectedCard', { card: selectedCard });
            setCanPlay(false);
        }
    };

    const handleSelectedCard = (card) => {
        if (playButtonDisabled) {
            setSelectedCard(showCard(card))
            setPlayButtonDisabled(false)
        } else {
            setSelectedCard(undefined)
            setPlayButtonDisabled(true)
        }
    }

    useEffect(() => {
        console.log(othersCards);
    }, [othersCards]);

    return (
        <div className="flex flex-col h-full overflow-hidden select-none">

            <div className="relative flex-1 flex flex-row items-center justify-center">

                <div className="mr-5 flex flex-row items-start space-x-8 border-gray-400 border-4 rounded-xl p-4 scale-75">
                    {Object.keys(players).map((player, i) => (
                        <div key={i} className={`relative flex flex-col items-center justify-center space-y-2 p-1 rounded-lg`}>
                            {/*currentBest === player ? <span className="absolute rotate-[-37deg] bottom-[7.2rem] right-[3.8rem]" ><GiQueenCrown size={40} color="#ffca44" /></span> : ""*/} 
                            <div className=" bg-gray-400 rounded-full flex items-center justify-center">
                                <img src={players[player].profilePicture} className="w-[70px] h-[70px] border-gray-300 border-2 rounded-full object-cover" />
                            </div>
                            <div className="flex flex-col bg-[#27273c] min-w-[100px] -space-x-1 rounded-lg text-center">
                                <span className="text-lg">{players[player].username}</span>
                                <span className="text-lg font-bold">{leaderboard[player]}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <div className="flex flex-row justify-evenly">
                <div className="overflow-x-auto flex scale-90 -space-x-8 items-center justify-center border-dashed border-4 p-4 rounded-lg max-w-[100vh]">
                    <div className="flex -space-x-8 relative left-[90vh] pr-1">
                        {hand.map((card, i) => {
                            const cardType = "b_" + showCard(card).replace(" de ", "_").replace(" ", "_").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                            return (
                                <div
                                    key={i}
                                    className={`cursor-pointer w-[8rem] h-[11rem] hover:scale-105 hover:z-40 transition ease-in-out ${selectedCard === showCard(card) ? "hover:scale-110 scale-110 z-50" : ""}`}
                                    onClick={() => handleSelectedCard(card)}
                                >
                                    <Cards type={cardType} width="32" height="44" />
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