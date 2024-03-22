import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './home/Navbar';
import axios from '../api/axios';
import { PiCoinsDuotone } from 'react-icons/pi';
import MilleBornesBg from '../assets/millebornes.png';

const gameTypeToName = {
    bataille: 'Bataille',
    milleBornes: 'Mille Bornes',
    sixQuiPrend: 'Six qui prend !',
}

const User = () => {
    const { username } = useParams();
    const [userData, setUserData] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isServerDown, setIsServerDown] = useState(false);
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [gamesWon, setGamesWon] = useState(0);
    const [profilePage, setProfilePage] = useState('stats');

    useEffect(() => {
        let data;
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`/api/user/${username}`);
                data = response?.data;
            } catch (err) {
                if (!err?.message) {
                    console.log(
                        '[User.js] Warning: Failed to fetch user data from API. (API_UNAVAILABLE)',
                    );
                    setIsServerDown(true);
                } else if (err.response?.status == 404)
                    console.log(
                        '[User.js] Warning: Failed to fetch user data from API. (USER_NOT_FOUND)',
                    );
                data = {};
            } finally {
                let gamesPlayed = 0;
                let gamesWon = 0;
                for (const game in data.stats) {
                    gamesPlayed += data.stats[game].gamesPlayed;
                    gamesWon += data.stats[game].wins;
                }
                setGamesPlayed(gamesPlayed);
                setGamesWon(gamesWon);
                setUserData(data);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return isLoading ? (
        <p className="text-white">Chargement en cours...</p>
    ) : isServerDown ? (
        <p className="text-white">
            Failed to fetch user data from API. (API_UNAVAILABLE)
        </p>
    ) : Object.keys(userData).length == 0 ? (
        <p className="text-white">
            Désolé, nous n'avons pas trouvé d'utilisateur nommé {username}.
        </p>
    ) : (
        <>
            <div className="flex flex-col h-[100vh]">
                <Navbar />
                <div className="flex-1 text-white flex justify-center items-center">
                    <div className="flex flex-row space-x-4">
                        <div className="bg-[#39324f] rounded-l-3xl p-6 w-72">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-row space-x-5 items-center">
                                    <img
                                        src={userData.profilePicture}
                                        className="w-20 h-20 bg-white rounded-full"
                                    />
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-2xl font-bold">
                                            {userData.username}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Utilisateur
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row space-x-2">
                                <div
                                    onClick={() => setProfilePage('stats')}
                                    className={`${
                                        profilePage === 'stats'
                                            ? 'bg-[#2d2840]'
                                            : 'bg-gradient-to-b from-[#2d2840] to-[#1b1827] '
                                    } py-3 px-16 font-bold rounded-t-xl cursor-pointer`}>
                                    Statistiques
                                </div>
                                <div
                                    onClick={() => setProfilePage('exp')}
                                    className={`${
                                        profilePage === 'exp'
                                            ? 'bg-[#2d2840]'
                                            : 'bg-gradient-to-b from-[#2d2840] to-[#1b1827] '
                                    } py-3 px-16 font-bold rounded-t-xl cursor-pointer`}>
                                    Exp. et Argent
                                </div>
                                <div
                                    onClick={() => setProfilePage('inventory')}
                                    className={`${
                                        profilePage === 'inventory'
                                            ? 'bg-[#2d2840]'
                                            : 'bg-gradient-to-b from-[#2d2840] to-[#1b1827] '
                                    } py-3 px-16 font-bold rounded-t-xl cursor-pointer`}>
                                    Inventaire
                                </div>
                            </div>
                            <div className="bg-[#2d2840] space-y-5 p-6">
                                <p className="text-lg font-bold">
                                    Statistiques générales
                                </p>
                                <div className="flex flex-row space-x-4">
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-sm text-gray-400">
                                            Nombre de parties jouées
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {gamesPlayed}
                                        </p>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-sm text-gray-400">
                                            Nombre de parties gagnées
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {gamesWon}
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-lg font-bold">
                                    Statistiques de jeux
                                </p>
    
                                <div className="flex flex-row space-x-5">
                                    {Object.keys(userData.stats).map(gameType => (
                                        <div className="flex flex-col space-y-2 bg-[#00000048] rounded-lg">
                                            <span className="font-bold text-xl bg-[#4e758b] text-center py-4 px-6 rounded-t-lg">
                                                {gameTypeToName[gameType]}
                                            </span>
                                            <div className="flex flex-col px-5 py-2 pb-4 space-y-3">
                                                <span>Parties jouées : <span className="font-bold">{userData.stats[gameType].gamesPlayed}</span></span>
                                                <span>Victoires : <span className="font-bold">{userData.stats[gameType].wins}</span></span>
                                                <span>Défaites : <span className="font-bold">{userData.stats[gameType].loses}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default User;
