import { createContext, useState } from "react";
import useSocket from "../hooks/useSocket";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const socket = useSocket();

    const [gameTitle, setGameTitle] = useState("");
    const [gameType, setGameType] = useState("");
    const [gameState, setGameState] = useState("");
    const [chat, setChat] = useState([]);
    const [playerNumber, setPlayerNumber] = useState(0);

    const socketEmit = (channel, code, data) => {
        const message = {
            headers: {
                code: code,
                gameType: gameType,
                channel: channel,
            },
            body: data,
        };
        socket.emit("client.message", message);
    };

    return (
        <GameContext.Provider
            value={{
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
                socketEmit,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export default GameContext;
