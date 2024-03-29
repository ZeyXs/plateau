import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUnlockAlt } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";
import useGame from "../hooks/useGame";
import Lobby from "./games/Lobby";
import Bataille from "./games/Bataille";
import MilleBornes from "./games/MilleBornes";

const Game = () => {
    const socket = useSocket();
    const navigate = useNavigate();
    const { auth } = useAuth();
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
        creatorId,
        setCreatorId,
        size,
        setSize,
        emit,
    } = useGame();

    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const handleSendMessage = () => {
        if (newMessage) {
            emit("client.sendMessage", {
                code: code,
                username: auth.user,
                message: newMessage,
            });
            setNewMessage("");
        }
    };

    const handleKeyDownSendMessage = (e) => {
        setNewMessage(e.target.value);
        if (newMessage && e.key === "Enter") {
            emit("client.sendMessage", {
                code: code,
                username: auth.user,
                message: newMessage,
            });
            setNewMessage("");
        }
    };

    const handleLeave = () => {
        emit("client.leave", { code: code, username: auth.user });
    };

    useEffect(() => {
        const cleanup = () => {
            handleLeave();
        };

        window.addEventListener("beforeunload", cleanup);

        return () => {
            window.removeEventListener("beforeunload", cleanup);
        };
    }, []);

    useEffect(() => {

        /*
        _____ Message: 'server.joinSuccess' _____
        In params: { gameTitle, gameType, gameState, chat }
        */
        socket.on("server.joinSuccess", (data) => {
            setGameTitle(data.gameTitle);
            setGameType(data.gameType);
            setGameState(data.gameState);
            setChat(data.chat);
            setCreatorId(data.creatorId);
            setPlayers(data.players);
            setIsLoading(false);
        });

        /*
        _____ Message: 'server.updateChat' _____
        In params: { message }
        */
        socket.on("server.updateChat", (data) => {
            setChat((prev) => [...prev, data.message]);
        });

        /*
        _____ Message: 'server.updatePlayerNumber' _____
        In params: { playerNumber }
        */
        socket.on("server.updatePlayerNumber", (data) => {
            setPlayerNumber(data.playerNumber);
            setSize(data.size);
        });

        /*
        _____ Message: 'server.addToLocalStorage' _____
        In params: { code }
        */
        socket.on("server.addToLocalStorage", (data) => {
            localStorage.setItem("brutallyLeft", data.code);
        });

        /*
        _____ Message: 'server.leaveSuccess' _____
        In params: null
        */
        socket.on("server.leaveSuccess", (data) => {
            navigate("/", { replace: true });
        });

        emit("client.join", { code: code, username: auth.user });
    }, []);

    return (
        <div className="flex flex-col text-white">
            <div className="flex space-x-8 whitespace-nowrap h-[60px] items-center bg-[#14141e] shadow-lg z-50">
                <div className="flex flex-row ml-5">
                    <span className="mr-2">
                        <FaUnlockAlt size={23} color="orange" />
                    </span>
                    <p className="text-lg">
                        Code de la partie : <b>{code}</b>
                    </p>
                </div>
                <p className="px-3 py-1  rounded-xl bg-slate-600">
                    {playerNumber} {playerNumber > 1 ? "joueurs" : "joueur"}
                </p>
                <p className="text-lg">{gameTitle}</p>
            </div>
            <div className="flex flex-2 flex-row flex-grow">
                <div
                    className="flex-1 text-white text-3xl"
                    style={{ height: "calc(100vh - 60px)" }}
                >
                    {isLoading ? (
                        <p>Chargement en cours...</p>
                    ) : gameState == "IN_LOBBY" ? (
                        <Lobby />
                    ) : gameType == "Bataille" ? (
                       <Bataille />
                    ) : gameType == "SixQuiPrend" ? (
                        <p>SixQuiPrend{/*<SixQuiPrend/>*/}</p>
                    ) : gameType == "MilleBornes" ? (
                        <MilleBornes/>
                    ) : (
                        <p>Erreur</p>
                    )}
                </div>
                <div
                    className="flex-initial w-1/6 bg-[#27273c] overflow-auto flex flex-col"
                    style={{ height: "calc(100vh - 60px)" }}
                >
                    <div className="flex-grow overflow-auto ">
                        {chat.map((msg, i) => (
                            <p key={i} className="text-gray-300">
                                {msg}
                            </p>
                        ))}
                    </div>
                    <div className="flex-initial w-full text-black flex flex-row">
                        <input
                            className="text-sm py-4 w-full ps-1 border border-gray-300 rounded-t-md"
                            type="text"
                            placeholder="Taper votre message…"
                            onChange={(e) => setNewMessage(e.target.value)}
                            value={newMessage}
                            onKeyDown={handleKeyDownSendMessage}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-violet-500 text-white px-4 py-2 rounded-t-md focus:outline-none"
                        >
                            <IoMdSend size={25} />
                        </button>
                        {/*<button onClick={handleLeave} className="bg-red-500 text-white px-4 py-2">Quitter</button>*/}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
