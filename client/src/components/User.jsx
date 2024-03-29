import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './home/Navbar';
import axios from '../api/axios';
import { PiCoinsDuotone } from 'react-icons/pi';
import MilleBornesBg from '../assets/millebornes.png';
import { IoWarning } from "react-icons/io5";
import { LuConstruction } from "react-icons/lu";
import { FaHome, FaShoppingCart } from 'react-icons/fa';
import { IoMdExit } from "react-icons/io";
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import { FaPen } from 'react-icons/fa6';
import Modal from './utils/Modal';
import useAxiosPrivate from '../hooks/useAxiosPrivate';


const gameTypeToName = {
    bataille: 'Bataille',
    milleBornes: 'Mille Bornes',
    sixQuiPrend: 'Six qui prend !',
};

const User = () => {
    const { username } = useParams();
	const { auth } = useAuth();
	const navigate = useNavigate();
	const logout = useLogout();
    const axiosPrivate = useAxiosPrivate();

    const [userData, setUserData] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isServerDown, setIsServerDown] = useState(false);
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [gamesWon, setGamesWon] = useState(0);
    const [profilePage, setProfilePage] = useState('stats');
    const [modal, setModal] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newProfilePicture, setNewProfilePicture] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [widthExp, setWidthExp] = useState(0);

	const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    }

    const handleModal = () => {
        setNewUsername(userData.username);
        setNewProfilePicture("");
        setModal(!modal);
    };

    const handleEditProfile = () => {
        setSubmitDisabled(true);
        const profilePicture = newProfilePicture.length === 0 ? userData.profilePicture : newProfilePicture;
        axiosPrivate.post(`user/edit`, {username: userData.username, newUsername: newUsername, newProfilePicture: profilePicture}).then(() => {
            setModal(false);
            setUserData({...userData, username: newUsername, profilePicture: profilePicture});
            setSubmitDisabled(false);
            navigate(`/user/${newUsername}`, { replace: true });
        });
    }

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

    useEffect(() => {
        if (userData !== undefined) {
            setWidthExp(Math.floor(userData.previous*100/(userData.next+userData.previous)));
        }
    }, [userData]);
    
    useEffect(() => {
        if (newUsername.length > 0 && (newProfilePicture.match(/\.(jpeg|jpg|gif|png)$/) || newProfilePicture.length === 0)) setSubmitDisabled(false);
        else setSubmitDisabled(true);
    }, [newUsername, newProfilePicture]);

    
	return isLoading ? (
		<p className="text-white h-[100vh]">Chargement en cours...</p>
	) : isServerDown ? (
		<p className="text-white h-[100vh]">
			Failed to fetch user data from API. (API_UNAVAILABLE)
		</p>
	) : Object.keys(userData).length == 0 ? (
		<p className="text-white h-[100vh]">
			Désolé, nous n'avons pas trouvé d'utilisateur nommé {username}.
		</p>
	) : (
		<>
			<div className="flex flex-col h-[100vh]">
				<Navbar />
				<div className="flex-1 text-white flex justify-center items-center">
					<div className="flex flex-row space-x-4 lg:scale-125 md:scale-100">
						<div className="bg-[#39324f] rounded-l-3xl p-6 w-72 h-[470px]">
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
								<div onClick={() => navigate('/')} className="pt-5 flex flex-row space-x-1 opacity-100 hover:opacity-75 transition ease-in-out cursor-pointer items-center"><FaHome size={20} /><p>Retourner à l'accueil</p></div>
								<div onClick={() => navigate('/shop')} className="flex flex-row space-x-1 opacity-100 hover:opacity-75 transition ease-in-out cursor-pointer items-center"><FaShoppingCart size={20} /><p>Aller à la boutique</p></div>
								{auth.id === userData._id ? 
                                    <>
                                        <div onClick={handleModal} className="flex flex-row space-x-1 opacity-100 hover:opacity-75 transition ease-in-out cursor-pointer items-center">
                                            <FaPen size={18} color="#4b84ef" />
                                            <p className="text-[#4b84ef]">Modifier le profil</p> 
                                        </div>
                                        <div onClick={handleLogout} className="flex flex-row space-x-1 opacity-100 hover:opacity-75 transition-1s ease-in-out cursor-pointer items-center">
                                            <IoMdExit size={21} color="#ef4b4b" />
                                            <p className="text-[#ef4b4b]">Se déconnecter</p>
                                        </div>
                                    </>
                                : ""}

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

                            <div className="bg-[#2d2840] space-y-5 p-6 h-full rounded-br-xl">
                                {profilePage === 'stats' ? (
                                    <>
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
                                            {Object.keys(userData.stats).map(
                                                gameType => (
                                                    <div className="flex flex-col space-y-2 bg-[#00000048] rounded-lg">
                                                        <span className="font-bold text-xl bg-[#4e758b] text-center py-4 px-6 rounded-t-lg">
                                                            {gameTypeToName[gameType]}
                                                        </span>
                                                        <div className="flex flex-col px-5 py-2 pb-4 space-y-3">
                                                            <span>
                                                                Parties jouées :{' '}
                                                                <span className="font-bold">
                                                                    {userData.stats[gameType].gamesPlayed}
                                                                    </span>
                                                            </span>
                                                            <span>
                                                                Victoires :{' '}
                                                                <span className="font-bold">
                                                                    {userData.stats[gameType].wins}
                                                                </span>
                                                            </span>
                                                            <span>
                                                                Défaites :{' '}
                                                                <span className="font-bold">
                                                                    {userData.stats[gameType].loses}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </>
                                ) : profilePage === 'exp' ? (
									<>
                                        <p className="text-lg font-bold">
                                            Éxperience et argent
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Niveau actuel
                                        </p>
                                        <div className="relative bg-[#4e4663] rounded-full h-5 max-w-[500px]">
                                            <div class="relative bottom-2.5 z-20 h-10 w-10 rounded-full bg-[#ffb82b] border-[2px] shadow-3xl text-white font-bold flex items-center justify-center">
                                                {userData.level}
                                            </div>
                                            <span className="absolute z-10 left-1/2 bottom-0 transform -translate-x-1/2 text-sm font-bold">
                                                {userData.previous}/{userData.next+userData.previous}
                                            </span>
                                            <div className={`bg-[#ffca2b] h-5 rounded-full absolute top-1/2 transform -translate-y-1/2`} style={{ width: widthExp + "%" }}></div>
                                        </div>

                                        <p className="text-sm text-gray-400">
                                            Argent
                                        </p>
                                        <div className="flex flex-row space-x-2 items-center">
                                            <PiCoinsDuotone
                                                size={30}
                                                className="text-yellow-500"
                                            />
                                            <p className="text-xl font-bold">
                                                {userData.coins}
                                            </p>
                                        </div>
									</>
                                ) : (
                                    <div className="font-bold flex flex-row space-x-1 justify-center items-center h-full"><span><IoWarning size={24} color="gold"/></span><span>Work in progress...</span></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Modal title="Modifier le profil" onClose={handleModal} visible={modal}>
                    <div className="flex flex-col space-y-4 text-white p-2">
                        <div className="flex flex-row space-x-5 items-center">
                            <img
                                src={newProfilePicture.match(/\.(jpeg|jpg|gif|png)$/) != null ? newProfilePicture  : userData.profilePicture}
                                className="w-20 h-20 bg-white rounded-full"
                            />
                            <div className="flex flex-col space-y-2">
                                <p className="text-2xl font-bold">
                                    {newUsername || userData.username}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Utilisateur
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="username" className="text-sm text-gray-400">Modifier le nom d'utilisateur</label>
                            <input className="bg-gray-200 text-gray-900 text-sm rounded-3xl block w-full h-10 ps-4" type="text" id="username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="profilePicture" className="text-sm text-gray-400">Modifier la photo de profil<br/>(Renseigner un lien vers une image)</label>
                            <input className="bg-gray-200 text-gray-900 text-sm rounded-3xl block w-[300px] h-10 ps-4" type="text" id="profilePicture" value={newProfilePicture} onChange={e => setNewProfilePicture(e.target.value)} />
                        </div>
                        <div className="flex flex-row space-x-2 pt-3">
                            <button type="button" onClick={handleEditProfile} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded" disabled={submitDisabled}>
                                Enregistrer
                            </button>
                            <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded" onClick={handleModal} >
                                Annuler
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default User;
