import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSocket from "../hooks/useSocket";

const Game = () => {

    const socket = useSocket();
    const { code } = useParams();

    useEffect(() => {
        socket.emit('join', code);
        // Ajouter le joueur à la base de données

        return () => {
            socket.emit('leave', code);
        }
    }, [socket]);

    return (
        <div className="flex h-[100vh] justify-center items-center text-white text-3xl">
            code = {code}
        </div>
    );
};

export default Game;
