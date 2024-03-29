import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import useGame from '../../hooks/useGame';
import { useNavigate } from 'react-router-dom';
import Cards from './Cards';

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
    const [selectedLine, setSelectedLine] = useState('0');
    const [scoreboard, setScoreboard] = useState({});

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

    useEffect(() => {
        console.log('Prêt à recevoir des socket');

        socket.on('server.sendHand', data => {
            console.log('Receiving data...');
            setHand(data.hand);
            console.log('Data to start game received.');
        });

        socket.on('server.canPlayAgain', lines => {
            console.log('Receiving can play again signal...');
            setLines(lines);
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
            let slines = data.lines;
            setLines(slines);
            setSelectedLine('0');
            setCanSelectLine(true);
        });

        socket.on('server.scoreboardChanged', newScoreboard => {
            console.log('Scoreboard updated.');
            console.log(newScoreboard);
            setScoreboard(newScoreboard);
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
            setCanPlay(sCanPlay);
            setHand(sHand);
            setLines(sLines);
            setPlayersData(sPlayersData);
            setScoreboard(sScoreboard);
            console.log('selected card', selectedCard);
        });

        socket.on('server.gameEnded', data => {
            console.log('server.gameEnded');
            console.log(data);
            const sWinner = data.winner;
            const sFinalScoreboard = data.finalScoreboard;
            alert(
                'Winner: ' + sWinner + '\n' + JSON.stringify(sFinalScoreboard),
            );
            navigate('/', { replace: true });
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
    };

    const sendLine = () => {
        if (canSelectLine) {
            emit('client.lineBought', { lineNumber: parseInt(selectedLine) });
            setCanSelectLine(false);
            console.log('Line selected send to server');
        }
    };

    // Le select des lignes ne fonctionne pas, à réparer
    return (
        <>
            <div className="flex flex-col h-full overflow-hidden select-none">
                <div className="relative flex-1 flex flex-row items-center justify-center">
                    {/*<select
                        id="card_select"
                        value={selectedCard}
                        onChange={() =>
                            setSelectedCard(
                                document.getElementById('card_select').value,
                            )
                        }>
                        {hand.map(card => (
                            <option value={card}>{card}</option>
                        ))}
                    </select>
                    {canPlay && (
                        <button id="jouer-carte" onClick={playCard}>
                            Jouer la carte
                        </button>
                    )}
                    {canSelectLine && (
                        <select
                            name="line-selected"
                            id="select-line"
                            onChange={() => {
                                setSelectedLine(
                                    document.getElementById('select-line').value,
                                );
                            }}
                            value={selectedLine}>
                            {[1, 2, 3, 4].map(i => (
                                <option value={i - 1}>Ligne {i}</option>
                            ))}
                        </select>
                    )}
                    {canSelectLine && (
                        <button id="confirm-selected-line" onClick={sendLine}>
                            Sélectionner la ligne
                        </button>
                    )}
                    {lines.map((line, i) => (
                        <div key={i}>
                            <p>
                                <b>Ligne {i + 1}:</b>
                            </p>
                            <ul>
                                {line.map((card, index) => (
                                    <li key={index}>{card}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className="bg-[#45345f]">
                        <p>Scoreboard :</p>
                        <ul>
                            {Object.keys(scoreboard).map(playerId => (
                                <li>
                                    {playerId}. {scoreboard[playerId]}
                                </li>
                            ))}
                        </ul>
                    </div>*/}
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
                        <button className="bg-[#7fb352] hover:bg-[#93cc60] disabled:bg-[#8e8e8e] p-2 px-3 rounded-lg text-2xl transition ease-in-out" disabled={playButtonDisabled} >Jouer</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SixQuiPrend;
