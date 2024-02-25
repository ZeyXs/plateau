import { useEffect, useRef, useState } from "react";
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
        size,
        emit,
    } = useGame();

    const [slots, setSlots] = useState([]);
    const [radius, setRadius] = useState(0); // State to store the radius of the circle

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const updatedSlots = Array.apply(null, Array(size));
        (Object.keys(players)).map((player, i) => {
            updatedSlots[i] = player;
        })
        setSlots(updatedSlots);
    }, [size, players])


    useEffect(() => {

        socket.on("server.updatePlayers", (data) => {
            setPlayers(data.players);
            //appendPlayersToSlot(data.players);
        });

        window.addEventListener("resize", handleResize);

        //handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
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
                <p>{size}</p>
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
                            }}
                        >
                            <img
                                src={player !== undefined ? players[player] : "https://cdn.discordapp.com/avatars/1056667877899505695/dff0c3f5606eb3a6ab06405e31fff943?size=1024"}
                                className="absolute rounded-full border-2 border-white object-cover"
                            />
                            {player !== undefined ? <span className="z-10 text-sm">
                                {player}
                            </span> : ""}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Lobby;
