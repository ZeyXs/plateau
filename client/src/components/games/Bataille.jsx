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
    const [othersCards, setOthersCards] = useState({});
    const [roundState, setRoundState] = useState('');
    const [numberRound, setNumberRound] = useState(1);

    const [selectCard, setSelectCard] = useState([]);

    const [looser, setLooser] = useState(false);
    const [winner, setWinner] = useState(false);

    useEffect(() => {

        socket.on('server.playerData', data => {
            console.log('server.playerData');
            console.log(data);
            addHand(data.infos.hand);
        });

        socket.on('server.canPlayAgain', () => {
            console.log('server.canPlayAgain');
            if (!looser) {
                setCanPlay(true);
            }
        });

        socket.on('server.roundWinners', data => {
            console.log('server.roundWinners');
            for (let roundWinner of data.roundWinners) {
                if (roundWinner == auth.id) {
                    deleteAllDic(roundOtherCardPlayed);
                    setRoundState('Tu as gagné ce tour ! ');
                    addCards(data.cards);
                    setNumberRound(prevNumberRound => prevNumberRound + 1);
                }
            }
        });

        socket.on('server.roundLoosers', data => {
            console.log('server.roundLoosers');
            for (let roundLooser of data.roundLoosers) {
                if (roundLooser == auth.id) {
                    deleteAllDic(roundOtherCardPlayed);
                    setRoundState('Tu as perdu ce tour ! ');
                    setNumberRound(prevNumberRound => prevNumberRound + 1);
                }
            }
        });

        socket.on('server.equality', data => {
            if (auth.id == data.user) {
                console.log('server.equality');
                setRoundState('Egalite à ce tour !');
                setSelectCard(selectCard => {
                    var newSelectCard = selectCard.filter(
                        card => showCard(card) != showCard(data.userRandomCard),
                    );
                    setSelectedCard(showCard(newSelectCard[0]));
                    return newSelectCard;
                });
                setCanPlay(true);
            }
        });

        socket.on('server.otherCardPlayed', data => {
            console.log('server.otherCardPlayed');
            let dico = roundOtherCardPlayed;
            if (dico.hasOwnProperty(data.user)) {
                dico[data.user].push(showCard(data.userCard));
            } else {
                dico[data.user] = [showCard(data.userCard)];
            }
            setRoundOtherCardPlayed(dico);
        });

        socket.on('server.playersCards', data => {
            console.log('server.playersCards');
            let handsList = {};
            for (let player in data.playersCards) {
                handsList[player] = data.playersCards[player].hand;
            }
            setOthersCards(handsList);
        });

        socket.on('server.gameLoosers', data => {
            if (data.gameLoosers.length > 0) {
                console.log('server.gameLoosers');
                for (let gameLooser of data.gameLoosers) {
                    if (gameLooser == auth.id) {
                        setLooser(true);
                    }
                }
            }
        });

        socket.on('server.gameWinners', data => {
            if (data.gameWinners.length > 0) {
                console.log('server.gameWinners');
                for (let gameWinner of data.gameWinners) {
                    if (gameWinner == auth.id) {
                        setWinner(true);
                    }
                }
            }
        });

		return () => {
			socket.off('server.playerData');
			socket.off('server.canPlayAgain');
			socket.off('server.roundWinners');
			socket.off('server.roundLoosers');
			socket.off('server.equality');
			socket.off('server.otherCardPlayed');
			socket.off('server.playersCards');
			socket.off('server.gameLoosers');
			socket.off('server.gameWinners');
		}

    }, [socket]);

    const deleteAllDic = dico => {
        Object.keys(dico).forEach(key => delete dico[key]);
    };

    const showCard = card => {
        let values = {
            1: 'As',
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
        };
        return values[card['value']] + ' de ' + card['color'];
    };

    const addCards = cards => {
        console.log('je suis passé par là');
        setSelectCard(selectCard => {
            let newCards = [];
            if (selectCard.length === 0) {
                newCards = cards;
            } else {
                console.log(cards);
                cards.forEach(card => {
                    let isIn = selectCard.some(
                        c => showCard(c) === showCard(card),
                    );
                    if (!isIn) {
                        newCards.push(card);
                    }
                });
            }
            const newSelectCard = [...selectCard, ...newCards];
            console.log(newSelectCard);
            setSelectedCard(showCard(newSelectCard[0]));
            return newSelectCard;
        });
    };

    const addHand = cards => {
        if (selectCard.length > 0) {
            setSelectCard([]);
        }
        console.log('je suis passé ici');
        addCards(cards);
    };

    const playCard = () => {
        console.log('playCard');
        if (canPlay) {
            console.log(selectedCard);
            emit('client.selectedCard', { card: selectedCard });
            setSelectCard(selectCard => {
                var newSelectCard = selectCard.filter(
                    card => showCard(card) != selectedCard,
                );
                setSelectedCard(showCard(newSelectCard[0]));
                return newSelectCard;
            });
            setCanPlay(false);
        }
    };

    return (
        <>
            <div className="bg-white text-black">
                {
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
                {canPlay && !winner && (
                    <button id="jouer-carte" onClick={playCard}>
                        Jouer la carte
                    </button>
                )}
                {<p>Ceci est le tour numéro {numberRound}.</p>}
                {!winner && !looser && <p>{roundState}</p>}
                {winner && <p>Tu as gagné la partie !</p>}
                {looser && <p>Tu as perdu la partie !</p>}
                {Object.keys(roundOtherCardPlayed).map((p, j) => (
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
                ))}
                {Object.keys(othersCards).map((p, j) => (
                    <div key={j}>
                        <p>
                            <b>
                                Joueur {players[p].username} a{' '}
                                {othersCards[p].length} cartes.
                            </b>
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Bataille;
