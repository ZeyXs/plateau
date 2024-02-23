import { useEffect } from "react";
import useGame from "../../hooks/useGame";
import axios from "../../api/axios";

const Lobby = () => {

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
        socketEmit
    } = useGame();

    useEffect(() => {
        const fetchData = async () => {
            return await axios.get(`/api/game/${code}/players`);
        }
    }, [players])

    return (
        <div>
            <p>Voici les joueurs présents :</p>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>
        </div>
    )
}

export default Lobby;