import { useEffect, useRef, useState } from 'react';
import useGame from '../../hooks/useGame';
import useSocket from '../../hooks/useSocket';
import { ReactComponent as BatailleIcon } from '../../assets/bataille.svg';
import useAuth from '../../hooks/useAuth';
import { CSSTransition } from 'react-transition-group';

const Lobby = () => {
    const socket = useSocket();
    const { auth } = useAuth();

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
        creatorId,
        setCreatorId,
        players,
        setPlayers,
        size,
        setSize,
        emit,
    } = useGame();

    const [slots, setSlots] = useState([]);
    const [radius, setRadius] = useState(0);
    const [timer, setTimer] = useState(null);
    const [countdown, setCountdown] = useState(15);
    const nodeRef = useRef(null);
    const timerRef = useRef(null); // Utilisation d'une référence pour stocker l'ID du minuteur

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const updatedSlots = Array.apply(null, Array(size));
        Object.keys(players).map((player, i) => {
            updatedSlots[i] = player;
        });
        setSlots(updatedSlots);
    }, [size, players]);

    useEffect(() => {

        socket.on('server.updatePlayers', data => {
            setPlayers(data.players);
            clearInterval(timerRef.current);
            setCountdown(15);
            emit('client.startTimer', { players: data.players });
        });

        socket.on('server.startTimer', data => {
            if (Object.keys(data.players).length === size) {
                clearInterval(timerRef.current);
                let timeout = setInterval(() => {
                    setCountdown(prevCountdown => {
                        if (prevCountdown === 1) {
                            clearInterval(timerRef.current);
                            handleStart();
                        }
                        return prevCountdown - 1;
                    });
                }, 1000);
                timerRef.current = timeout;
            }
        });

        socket.on("server.requestHandshake", () => {
            // On fait en sorte que chaque joueur soit dans l'état IN_GAME pour pouvoir correctement lancer la partie
            setGameState("IN_GAME");
            emit("client.receivedHandshake", {});
        });

    }, [socket, size]);

    const handleResize = () => {
        const containerSize = Math.min(window.innerWidth, window.innerHeight);
        const newRadius = containerSize * 0.3;
        setRadius(newRadius);
    };

    const handleStart = () => {
        if (creatorId === auth.id) {
            emit('client.start', {});
        }
    }

    return (
        <>
            {Object.keys(players).length === size && (
                <CSSTransition
                    nodeRef={nodeRef}
                    in={true}
                    timeout={300}
                    classNames="alert"
                    unmountOnExit>
                    <div className="relative" ref={nodeRef}>
                        <div className="absolute top-8 h-10 w-full z-5 bg-green-600 flex justify-center items-center">
                            <p className="text-lg">
                                La partie va démarrer dans {countdown} secondes
                                !{' '}
                                {creatorId === auth.id && (
                                    <span
                                        onClick={handleStart}
                                        className="font-bold underline cursor-pointer">
                                        Lancer la partie
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </CSSTransition>
            )}
            <div className="flex justify-center items-center h-full w-full">
                <div className="relative flex justify-center items-center">
                    <BatailleIcon />
                    {slots.map((player, index) => {
                        const angleIncrement = (2 * Math.PI) / size;
                        const imageSize = 40;
                        const angle = index * angleIncrement;
                        const x = Math.cos(angle) * radius - imageSize;
                        const y = Math.sin(angle) * radius - imageSize;

                        return (
                            <div
                                className="absolute flex flex-row h-16 w-16 space-y-24 items-center justify-center"
                                key={index}
                                style={{
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(50% + ${y}px)`,
                                }}>
                                {player !== undefined ? (
                                    <>
                                        <img
                                            src={players[player]}
                                            className="absolute rounded-full border-2 border-white h-16 w-16 object-cover"
                                        />
                                        <span className="z-10 text-sm">
                                            {player}
                                        </span>
                                    </>
                                ) : (
                                    <span className="absolute rounded-full border-2 border-gray-500 bg-black h-16 w-16"></span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Lobby;
