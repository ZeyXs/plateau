import { createContext, useState } from "react";
import useSocket from "../hooks/useSocket";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const socket = useSocket();
    const { code } = useParams();
    const { auth } = useAuth();

    const [gameTitle, setGameTitle] = useState("");
    const [gameType, setGameType] = useState("");
    const [gameState, setGameState] = useState("");
    const [chat, setChat] = useState([]);
    const [playerNumber, setPlayerNumber] = useState(0);
    const [players, setPlayers] = useState({});
    const [size, setSize] = useState(0);

    const emit = (channel, data) => {
        const message = {
            headers: {
                code: code,
                gameType: gameType,
                channel: channel,
                senderId: auth.id,
                senderUsername: auth.user,
            },
            body: data,
        };
        socket.emit("client.message", message);
    };

    return (
        <GameContext.Provider
            value={{
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
                setSize,
                emit,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export default GameContext;
