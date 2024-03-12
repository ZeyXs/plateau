import { useEffect, useRef, useState } from 'react';
import useGame from '../../hooks/useGame';
import useSocket from '../../hooks/useSocket';
import { ReactComponent as BatailleIcon } from '../../assets/bataille.svg';
import useAuth from '../../hooks/useAuth';


const Lobby = () => {
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

    const { auth } = useAuth();
    console.log(auth.user)

    const [slots, setSlots] = useState([]);
    const [radius, setRadius] = useState(0); // State to store the radius of the circle

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
            //appendPlayersToSlot(data.players);
        });

        window.addEventListener('resize', handleResize);

        //handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [socket]);

    const handleResize = () => {
        console.log(window.innerWidth);
        const containerSize = Math.min(window.innerWidth, window.innerHeight);
        const newRadius = containerSize * 0.3;
        setRadius(newRadius);
    };

    return (
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
    );
};

export default Lobby;
