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


    return (
        <>
        </>
    )
};

export default Bataille;