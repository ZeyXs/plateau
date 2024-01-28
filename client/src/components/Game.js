import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUnlockAlt } from 'react-icons/fa';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

const Game = () => {
    const { auth } = useAuth();
    const socket = useSocket();
    const { code } = useParams();
    const navigate = useNavigate();

    const [gameTitle, setGameTitle] = useState("");
    const [gameType, setGameType] = useState("");
    const [gameState, setGameState] = useState("");
    const [chat, setChat] = useState([]);
    const [playerNumber, setPlayerNumber] = useState(0);

    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const handleSendMessage = () => {
        if(newMessage) {
            socket.emit('client.sendMessage', { 
                code: code,
                username: auth.user,
                message: newMessage });
            setNewMessage("");
        }
    }

    const handleLeave = () => {
        socket.emit('client.leave', { code: code, username: auth.user });
    }

    useEffect(() => {
        const cleanup = () => {
            localStorage.setItem("brutallyLeft", code);
            handleLeave();
        }
        window.addEventListener('beforeunload', cleanup);
        return () => {
            window.removeEventListener('beforeunload', cleanup);
        }
    }, []);


    useEffect(() => {

        /*
        _____ Message: 'server.joinSuccess' _____
        In params: { gameTitle, gameType, gameState, chat }
        */
        socket.on('server.joinSuccess', (data) => {
            console.log("Recieved 'server.joinSuccess'");
            setGameTitle(data.gameTitle);
            setGameType(data.gameType);
            setGameState(data.gameState);
            setChat(data.chat);
            setIsLoading(false);
        });


        /*
        _____ Message: 'server.updateChat' _____
        In params: { message }
        */
        socket.on('server.updateChat', (data) => {
            console.log("Recieved 'server.updateChat'");
            setChat(prev => [...prev, data.message]);    
        });


        /*
        _____ Message: 'server.updatePlayerNumber' _____
        In params: { playerNumber }
        */
        socket.on('server.updatePlayerNumber', (data) => {
            console.log("Recieved 'server.updatePlayerNumber'");
            setPlayerNumber(data.playerNumber);
        });


        /*
        _____ Message: 'server.addToLocalStorage' _____
        In params: { code }
        socket.on('server.addToLocalStorage', (data) => {
            console.log("Recieved 'server.leaveSuccess'");
            localStorage.setItem("brutallyLeft", data.code);
        });
        */


        /*
        _____ Message: 'server.approvedDisconnection' _____
        In params: null
        socket.on('server.approvedDisconnection', () => {
            console.log("Recieved 'server.approvedDisconnection'");
            alert("AAAAAAAAAAA");
            socket.emit('client.leave', { code: code, username: auth.user });
        });
        */


        /*
        _____ Message: 'server.leaveSuccess' _____
        In params: null
        */
        socket.on('server.leaveSuccess', (data) => {
            console.log("Recieved 'server.leaveSuccess'");
            navigate('/', { replace: true });
        });
        







        socket.emit('client.join', {code: code, username: auth.user});

    }, []);






/*
    useEffect(() => {

        return () => {
            socket.emit('leave', code);
        };

    }, [socket]);
*/




    return (
        <div className="flex flex-col text-white">
            <div className="flex space-x-8 whitespace-nowrap h-[60px] items-center bg-[#14141e]">
                <div className="flex flex-row ml-5">
                    <span className="mr-2">
                        <FaUnlockAlt size={23} color="orange" />
                    </span>
                    <p className="text-lg">
                        Code de la partie : <b>{code}</b>
                    </p>
                </div>
                <p className="px-3 py-1 rounded-xl bg-slate-600">
                    {playerNumber}
                </p>
                <p className="text-lg">{gameTitle}</p>
            </div>
            <div className="flex flex-2 flex-row flex-grow">
                <div className="flex-1 text-white text-3xl" style={{ height: 'calc(100vh - 60px)' }}>
                    {
                        isLoading ? <p>Chargement en cours...</p> :
                        gameType == "Bataille" ? <p>Bataille{/* <Bataille/> */}</p> :
                        gameType == "SixQuiPrend" ? <p>SixQuiPrend{/* <SixQuiPrend/> */}</p> : <p>Erreur</p>
                    }
                </div>
                <div className="flex-initial w-80 bg-[#27273c]" style={{ height: 'calc(100vh - 60px)' }}>
                    <div className="flex flex-col flex-grow ">
                        <div id="chat" className="h-full flex-grow-1">
                            {chat.map((msg) => (
                                <>
                                    <p>{msg}</p><br/>
                                </>
                            ))}
                        </div>
                        <div className="p-4 text-black">
			                <input
                                className="flex items-center h-10 w-full rounded px-3 text-sm"
                                type="text"
                                placeholder="Taper votre message…"
                                onChange={(e) => setNewMessage(e.target.value)}
                                value={newMessage}
                            />
                            <button onClick={handleSendMessage}>Envoyer</button>
                            <button onClick={handleLeave}>Quitter</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
