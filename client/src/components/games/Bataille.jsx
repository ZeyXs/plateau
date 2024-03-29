import useAuth from '../../hooks/useAuth';
import useGame from '../../hooks/useGame';
import useSocket from '../../hooks/useSocket';
import { useState, useEffect } from 'react';

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

    const [selectCard, setSelectCard] = useState([]);
    const [trash, setTrash] = useState([]);

    const [othersCards, setOthersCards] = useState({});
    const [othersTrashes, setOthersTrashes] = useState({});

    const [leaderboard, setLeaderboard] = useState(false);

    const [gameLoosers, setGameLoosers] = useState([]);
    const [gameWinner, setGameWinner] = useState("");

    useEffect(() => {

        socket.on('server.playerData', (data) => {
            addCards(data.infos.hand)
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
            let trashList = {}
            for (let player in data.playersCards) {
                handsList[player] = data.playersCards[player].hand;
                trashList[player] = data.playersTrashes[player]
                if (player == auth.id) {
                    addCards(data.playersCards[player].hand)
                    setTrash(data.playersTrashes[player]);
                }
            }
            setOthersCards(handsList);
            setOthersTrashes(trashList)
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

    }, [socket, selectCard, selectedCard, trash, gameWinner, gameLoosers]);

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
        return values[card['value']] + ' de ' + card['color'];
    };

    const addCards = (cards) => {
        setSelectCard(cards);
        if (cards.length == 0) {
            setSelectedCard("")
        } else {
            setSelectedCard(showCard(cards[0]));
        }

    };

    const playCard = () => {
        if (canPlay) {
            emit('client.selectedCard', { card: selectedCard });
            setCanPlay(false);
        }
    };

    return (
        <>
            <div className="bg-white text-black">
                {canPlay && !leaderboard &&
                    <select
                        id="selected-card"
                        onChange={event => {
                            setSelectedCard(event.target.value);
                        }}
                        value={selectedCard}>
                        {selectCard.map(card => {
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
            </div>
        </>
    );
};

export default Bataille;