import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { GiQueenCrown } from "react-icons/gi";
import { TiStarburst } from "react-icons/ti";
import { IoMdExit } from "react-icons/io";
import { TbMoodSad } from "react-icons/tb";

import useGame from '../../hooks/useGame';
import useAuth from '../../hooks/useAuth';



const PlayerWinPopup = ({ winner, finalScoreboard, newLevel }) => {
    
    const { players } = useGame();
    const { auth } = useAuth();
    const navigate = useNavigate(); 
    const [scoreboard, setScoreboard] = useState(finalScoreboard);

    const handleNavigate = () => {
        navigate('/', { replace: true });
    }
 
    return (
        <div className="relative">
            <div className="absolute flex items-center justify-center backdrop-blur-[2px] bg-black w-full h-[96vh] bg-opacity-50 z-[100]">
                <div className="flex flex-col items-center space-y-4 bg-[#27273c] w-96 rounded-xl p-5">
                    {winner === auth.id ? (
                        <div className="flex flex-row space-x-3 text-amber-400">
                            <div><GiQueenCrown size={45} /></div>
                            <p className="text-4xl font-bold">VICTOIRE !</p>
                        </div>
                    ) : (
                        <div className="flex flex-row space-x-3 items-center text-red-500">
                            <div><TbMoodSad size={45} /></div>
                            <p className="text-4xl font-bold">DÉFAITE !</p>
                        </div>
                    )}
                    <p className="text-xl"><span className="font-bold">{players[winner].username}</span> gagne la partie !</p>
                    <span className="w-full border-2 rounded-lg"></span>
                    <div className="bg-[#202031] flex flex-col space-y-1 w-full min-h-36 items-center rounded-lg p-1 overflow-auto">
                        {Object.keys(finalScoreboard).map((playerId, index) => (
                            <div className="flex flex-row w-full h-16 bg-[#171722] rounded-xl">
                                <div className="flex w-14 h-full rounded-l-xl bg-[#1b1b27] justify-center items-center">
                                    <div className="font-bold text-2xl">{index+1}</div>
                                </div>
                                <div className="flex-1 flex flex-row items-center space-x-3">
                                    <img src={players[playerId].profilePicture} className="w-10 h-10 ml-3 border-gray-300 border-2 rounded-full object-cover" />
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-lg font-bold">{players[playerId].username}</p>
                                        <p className="text-lg">Score : {finalScoreboard[playerId]}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <span className="w-full border-2 rounded-lg"></span>
                    {winner === auth.id && (
                        <>
                            {newLevel === undefined && (
                                <>
                                    <p className="text-lg">Vous êtes désormais niveau {newLevel} !</p>
                                    <div className="w-60 py-3">
                                        <div className="relative">
                                            <div className="relative bg-[#4e4663] rounded-full h-5 max-w-[500px]">
                                                <div className="relative bottom-2.5 z-20 h-10 w-10 rounded-full bg-[#ffb82b] shadow-3xl text-white font-bold flex items-center justify-center">
                                                    {newLevel - 1}
                                                </div>
                                                <motion.div intial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "easeInOut" }} className={`bg-[#ffca2b] h-5 rounded-full absolute top-1/2 transform -translate-y-1/2`}></motion.div>
                                            </div>
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute -right-4 -top-6 z-20 flex items-center justify-center">
                                                <div><TiStarburst size={65} color="#ffb82b" /></div>
                                            </motion.div>
                                            <p className="absolute right-2 z-30 -top-2.5">{newLevel}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                            <p className="text-lg">+ 5 EXP Victoire</p>
                        </>
                    )}
                    <div onClick={handleNavigate} className="flex flex-row space-x-2 text-white bg-violet-500 hover:bg-violet-400 p-2 px-3 rounded-lg items-center cursor-pointer">
                        <div><IoMdExit /></div>
                        <p className="text-xl font-bold">Retourner au menu</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerWinPopup;
