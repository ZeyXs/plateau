import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FaCircle } from 'react-icons/fa';
import { FaDiamond } from 'react-icons/fa6';

import Cards from './Cards';

const PlayerInfo = memo(({ playerId, playersData, attacks, bonuses }) => {
    return (
        <motion.div initial={{ scale: 0.9, x: -20 }} animate={{ x: 20, scale: 1 }} className="absolute left-32 -top-7 w-72 h-60 rounded-lg text-sm bg-[#2d2d46] space-y-1 flex flex-col p-4">
            <span className="absolute top-[5.5rem] -left-[0.7rem] -z-10"><FaDiamond size={26} color="#2d2d46" /></span>
            <div className="flex flex-row items-center">
                <span className="mr-2">
                    <FaCircle size={20} color="red" />
                </span>
                <span className="text-xl">Attaques reçues</span>
            </div>
            <div className="flex flex-row space-x-1">
                {Object.keys(attacks).map((cardValue, i) => (
                    <div key={i} className="w-[51px] h-[65px] border-gray-400 border-2 rounded-lg border-dotted">
                        <Cards type={cardValue} width="[48px]" height="[72px]" disabled={!playersData[playerId]?.malus.includes(cardValue)} />
                    </div>
                ))}
            </div>
            <motion.div className="flex flex-row items-center">
                <span className="mr-2">
                    <FaCircle size={20} color="lightgreen" />
                </span>
                <span className="text-xl">Bottes actives</span>
            </motion.div>
            <div className="flex flex-row space-x-1">
                {Object.keys(bonuses).map((cardValue, i) => (
                    <div key={i} className="w-[51px] h-[65px] border-gray-400 border-2 rounded-lg border-dotted">
                        <Cards type={cardValue} width="[48px]" height="[72px]" disabled={!playersData[playerId]?.bonus.includes(cardValue)} />
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

export default PlayerInfo;
