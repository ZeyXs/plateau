import { useEffect, useRef } from "react";
import useGame from "../../hooks/useGame";
import useSocket from "../../hooks/useSocket";

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
        emit,
    } = useGame();

    const totalImages = Object.keys(players).length;
    const angleIncrement = (2 * Math.PI) / totalImages;
    const imageSize = 40;
    
    useEffect(() => {

        socket.on("server.updatePlayers", (data) => {
            console.log("Received 'server.updatePlayers'");
            console.log('data.players :', data.players);
            setPlayers(data.players);
            console.log('players :', players);
        });

    }, [socket]);

    return (
        <div className="flex justify-center items-center h-full w-full">
            <div className="relative flex justify-center items-center">
                {(Object.keys(players)).map((player, index) => {
                    
                    const angle = index * angleIncrement;
                    const radius = 220;
                    const x = Math.cos(angle) * radius - imageSize;
                    const y = Math.sin(angle) * radius - imageSize;

                    return (
                        <div
                            className="absolute flex flex-row h-16 w-16 space-y-24 items-center justify-center"
                            key={index}
                            style={{
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`,
                            }}
                        >
                            <img
                                src={players[player]}
                                className="absolute rounded-full border-2 border-white object-cover"
                            />
                            <span className="z-10 text-sm">
                                {player}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Lobby;
