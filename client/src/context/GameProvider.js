import { createContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [gameTitle, setGameTitle] = useState('');
    const [gameType, setGameType] = useState('');
    const [gameState, setGameState] = useState('');
    const [chat, setChat] = useState([]);
    const [playerNumber, setPlayerNumber] = useState(0);

    const socketEmit = (channel, code, body) => {
        const message = {
            headers: {
                code: code,
                gameType: gameType,
                channel: channel,
            },
            body: body,
        };
        socket.emit(channel, message);
    };

    return (
        <GameContext.Provider value={{ gameTitle, setGameTitle, gameType, setGameType, gameState, setGameState, chat, setChat, playerNumber, setPlayerNumber }}>
            {children}
        </GameContext.Provider>
    );
};

export default GameContext;