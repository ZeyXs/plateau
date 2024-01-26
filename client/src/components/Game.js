import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaUnlockAlt } from 'react-icons/fa';
import useSocket from '../hooks/useSocket';
import axios from '../api/axios';

const Game = () => {
    const socket = useSocket();
    const [playerCount, setPlayerCount] = useState(0);
    const [gameTitle, setGameTitle] = useState('');
    const { code } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`/api/game/${code}`);
            const data = response.data;
            setGameTitle(data.title);
            setPlayerCount(Object.keys(data.players).length);
        };
        fetchData();
    }, []);

    useEffect(() => {
        socket.emit('join', code);
        // Ajouter le joueur à la base de données

        socket.on('updateGameInfo', data => {
            setPlayerCount(data.playerCount);
        });

        return () => {
            socket.emit('leave', code);
        };
    }, [socket, code]);

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
                    {playerCount}
                </p>
                <p className="text-lg">{gameTitle}</p>
            </div>
            <div className="flex flex-2 flex-row flex-grow">
                <div className="flex-1 text-white text-3xl" style={{ height: 'calc(100vh - 60px)' }}>code = {code}</div>
                <div className="flex-initial w-80 bg-[#27273c]" style={{ height: 'calc(100vh - 60px)' }}>
                    <div className="flex flex-col flex-grow ">
                        <div className="h-full flex-grow-1">
                            <p>admin: coucououuu</p>
                            <p>👤 User a rejoint la partie.</p>
                        </div>
                        <div class="p-4 text-black">
			                <input class="flex items-center h-10 w-full rounded px-3 text-sm" type="text" placeholder="Type your message…" />
		                </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
