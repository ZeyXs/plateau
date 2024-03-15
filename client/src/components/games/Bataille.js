import { useEffect } from "react";
import useGame from "../../hooks/useGame";
import useSocket from "../../hooks/useSocket";

const Bataille = () => {

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
        socketEmit
    } = useGame();

    useEffect(() => {

        socket.on("server.startGame", (data) => {
            console.log("Received 'client.start'");
        });

    }, [socket]);

    return (
        <>
            <h1>Bataille</h1>
        </>
    )
};

export default Bataille;