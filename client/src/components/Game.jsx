import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaUnlockAlt } from "react-icons/fa";
import { IoMdDoneAll, IoMdSend } from "react-icons/io";
import { ImExit } from "react-icons/im";

import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";
import useGame from "../hooks/useGame";
import Lobby from "./games/Lobby";
import Bataille from "./games/Bataille";
import MilleBornes from "./games/MilleBornes";
import SixQuiPrend from "./games/SixQuiPrend";
import Modal from "./utils/Modal";
import { FaTrash } from "react-icons/fa6";

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
    const [modal, setModal] = useState(false);

    useEffect(() => {
        console.log("----- USE EFFECT -----");
        console.log("gameTitle", gameTitle);
        console.log("gameState", gameState);
        console.log("players", players);
        console.log("creatorId", creatorId);
    }, [gameTitle, gameState, players, creatorId]);


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

    const handleExit = () => {
        if ((gameState == "IN_GAME") && creatorId == auth.id) {
            handleModal();
        } else {
            emit("client.leave", { code: code, username: auth.user });
            navigate("/", { replace: true });
        }
    }

    const handleModal = () => {
        setModal(!modal);
    }

    const handleLeave = () => {
        emit("client.leave", { code: code, username: auth.user });
        localStorage.setItem("brutallyLeft", code);
    };

    const handleSave = () => {
        emit("client.save", {});
        navigate("/", { replace: true });
    }

    const handleDelete = () => {
        emit("client.leave", { code: code, username: auth.user });
        navigate("/", { replace: true });
    }

    socket.on('server.resume', () => {
        setGameState('IN_GAME');
    });

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
            console.log("server.joinSuccess", data);
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
        _____ Message: 'server.leaveSuccess' _____
        In params: null
        */
        socket.on("server.leave", () => {
            navigate("/", { replace: true });
        });

        /*socket.on("server.gamePaused", (data) => {
            setSilentLeave(true);
            navigate("/", { replace: true });
        });*/

        socket.on("server.updateContext", (data) => {
            console.log("Recieved server.updateContext");
            setCreatorId(data.creatorId);
        });

        return () => {
            socket.off('server.joinSuccess');
            socket.off('server.updateChat');
            socket.off('server.updatePlayerNumber');
            socket.off('server.leave');
            socket.off('server.updateContext');
        };

    }, [socket]);

    useEffect(() => {
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
                <div className="flex flex-row justify-between w-full h-full">
                    <p className="text-lg flex items-center justify-center">{gameTitle}</p>
                    <button onClick={handleExit} className="bg-[#0c0c12] hover:bg-[#11111a] transition ease-in-out px-6 flex items-center justify-center"><div><ImExit size={24} color="white" /></div></button>
                </div>
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
                        <SixQuiPrend />
                    ) : gameType == "MilleBornes" ? (
                        <MilleBornes />
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
            <Modal
                title="Vous allez quitter la partie"
                visible={modal}
                onClose={handleModal}>
                <div className="flex flex-col space-y-4 justify-center items-center p-4">
                    <div className="text-center">
                        Voulez-vous sauvegarder la partie<br/> ou la supprimer ?
                    </div>
                    <div className="flex flex-row justify-center items-center space-x-4">
                        <button onClick={handleSave} className="p-2 rounded-full bg-green-500 flex items-center justify-center space-x-1"><div><FaSave size={19} /></div><p>Sauvegarder</p></button>
                        <button onClick={handleDelete} className="p-2 rounded-full bg-red-500 flex items-center justify-center space-x-1"><div><FaTrash size={16} /></div><p>Supprimer</p></button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Game;