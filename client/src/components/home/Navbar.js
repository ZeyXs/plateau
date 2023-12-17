import { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FaPlay, FaUser, FaUserPlus } from "react-icons/fa6";
import { LuLogIn } from "react-icons/lu";
import { GiPokerHand } from "react-icons/gi";
import { useLogout } from "react-router-dom";

import Modal from "../utils/Modal";

const Navbar = () => {
    const [nav, setNav] = useState(true);
    const [modal, setModal] = useState(false);

    const handleNav = () => {
        setNav(!nav);
    };

    const handleModal = () => {
        setModal(!modal);
    };

    return (
        <div>
            <div className="flex justify-between whitespace-nowrap items-center h-24 max-w-[1240px] mx-auto px-4 text-white">
                <h1 className="flex w-full text-3xl text items-center font-extrabold text-white">
                    <GiPokerHand size={80} color="#984ed4" />
                    <span className="px-4">Plateau</span>
                </h1>
                <ul className="hidden md:flex items-center h-24">
                    <li className="p-4">
                        <a href="/">Accueil</a>
                    </li>
                    <li className="p-4">
                        <a href="/login" className="flex items-center">
                            <LuLogIn size={18} />
                            <span className="px-2">Se connecter</span>
                        </a>
                    </li>
                    <li className="p-3">
                        <button
                            onClick={handleModal}
                            className={`bg-[#984ed4] w-[140px] rounded-3xl my-4 mx-auto py-2`}
                        >
                            <div className="flex justify-center items-center">
                                <FaPlay size={13} />
                                <span className="font-bold px-[5px]">
                                    Jouer
                                </span>
                            </div>
                        </button>
                    </li>
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
                            ? "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500"
                            : "fixed left-[-100%]"
                    }
                >
                    <h1 className="w-full text-3xl font-bold text-[#984ed4] m-4">
                        Plateau
                    </h1>
                    <ul className="uppercase p-4">
                        <li className="p-4 border-b border-gray-600">
                            Accueil
                        </li>
                        <li className="p-4">À propos</li>
                    </ul>
                </div>
            </div>
            <Modal
                title="Connexion requise"
                visible={modal}
                onClose={handleModal}
            >
                <div className="flex flex-col m-4 mx-8">
                    <a
                        href="/login"
                        className={`text-white bg-[#984ed4] w-[180px] rounded-3xl my-4 mx-auto py-2`}
                    >
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
                        className={`text-white bg-[#984ed4] w-[180px] rounded-3xl my-4 mx-auto py-2`}
                    >
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
