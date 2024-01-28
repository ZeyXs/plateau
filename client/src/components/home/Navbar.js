import { useEffect, useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { FaPlay, FaUser, FaUserPlus } from 'react-icons/fa6';
import { LuLogIn, LuLogOut } from 'react-icons/lu';
import { GiPokerHand } from 'react-icons/gi';

import Modal from '../utils/Modal';
import SearchBar from '../SearchBar';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import useLogout from '../../hooks/useLogout';

const Navbar = () => {
    const { auth } = useAuth();
    const [nav, setNav] = useState(true);
    const [modal, setModal] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/user/${auth?.user}`);
                setProfilePicture(response?.data.profilePicture);
            } catch (err) {
                console.warn("Failed to fetch user's profile picture from API.");
                setProfilePicture('');
            }
        };
        fetchData();
    }, []);
    
    const handdleLogout = useLogout();

    const handleNav = () => {
        setNav(!nav);
    };

    const handleModal = () => {
        setModal(!modal);
    };

    return (
        <div>
            <div className="flex justify-between whitespace-nowrap items-center h-24 max-w-max space-x-32 mx-auto px-4 text-white">
                <h1 className="flex text-3xl items-center font-extrabold text-white">
                    <GiPokerHand size={80} color="#984ed4" />
                    <span className="px-4">Plateau</span>
                </h1>
                <div>
                    <SearchBar />
                </div>
                <ul className="hidden md:flex items-center h-24">
                    <li className="p-4">
                        <a href="/">Accueil</a>
                    </li>
                    {auth?.accessToken ? (
                        <div className="flex justify-between whitespace-nowrap items-center">
                            <li className="p-4">
                                <a href="/login" onClick={handdleLogout} className="flex items-center">
                                    <LuLogOut size={18} />
                                    <span className="px-2">Déconnexion</span>
                                </a>
                            </li>
                            <li className="p-4">
                                <div className="relative">
                                    <img
                                        className="w-10 rounded-full"
                                        src={profilePicture}
                                    />
                                    <span className="bottom-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                </div>
                            </li>
                            
                        </div>
                    ) : (
                        <div className="flex justify-between whitespace-nowrap items-center">
                            <li className="p-4">
                                <a href="/login" className="flex items-center">
                                    <LuLogIn size={18} />
                                    <span className="px-2">Se connecter</span>
                                </a>
                            </li>
                            <li className="p-3">
                                <button
                                    onClick={handleModal}
                                    className={`bg-[#984ed4] w-[140px] rounded-3xl my-4 mx-auto py-2`}>
                                    <div className="flex justify-center items-center">
                                        <FaPlay size={13} />
                                        <span className="font-bold px-[5px]">
                                            Jouer
                                        </span>
                                    </div>
                                </button>
                            </li>
                        </div>
                        
                    )}
                </ul>
                <div onClick={handleNav} className="block md:hidden">
                    {!nav ? (
                        <AiOutlineClose size={30} />
                    ) : (
                        <AiOutlineMenu size={30} />
                    )}
                </div>
                <div
                    className={
                        !nav
                            ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500'
                            : 'fixed left-[-100%]'
                    }>
                    <h1 className="w-full text-3xl font-bold text-[#984ed4] m-4">
                        Plateau
                    </h1>
                    <ul className="uppercase p-4">
                        <li className="p-4 border-b border-gray-600">
                            Accueil
                        </li>
                    </ul>
                </div>
            </div>
            <Modal
                title="Connexion requise"
                visible={modal}
                onClose={handleModal}>
                <div className="flex flex-col m-4 mx-8">
                    <a
                        href="/login"
                        className={`text-white bg-[#984ed4] w-[180px] rounded-3xl my-4 mx-auto py-2`}>
                        <div className="flex justify-center items-center">
                            <FaUser size={13} />
                            <span className="font-bold px-[5px]">
                                Se connecter
                            </span>
                        </div>
                    </a>
                    <div className="text-gray-200 justify-center mx-auto">
                        ou
                    </div>
                    <a
                        href="/register"
                        className={`text-white bg-[#984ed4] w-[180px] rounded-3xl my-4 mx-auto py-2`}>
                        <div className="flex justify-center items-center">
                            <FaUserPlus size={16} />
                            <span className="font-bold px-[5px]">
                                S'inscrire
                            </span>
                        </div>
                    </a>
                </div>
            </Modal>
        </div>
    );
};

export default Navbar;
