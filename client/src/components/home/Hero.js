import { GiPerspectiveDiceSixFacesThree } from 'react-icons/gi';
import { FaList } from 'react-icons/fa6';
import { MdAddBox } from 'react-icons/md';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '../utils/Box';
import CreateGame from './CreateGame';
import GameList from './GameList';

const Hero = () => {
    const navigate = useNavigate();
    const [codeToJoin, setCodeToJoin] = useState("");

    const handleNavigate = () => {
        navigate(`/game/${codeToJoin}`, { replace: true });
    };

    return (
        <div className="text-white">
            <div className="mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center">
                <div className="flex mx-auto space-x-24">
                    <div className="flex flex-rw space-x-24">
                        <Box
                            title="Créer une partie"
                            icon={
                                <GiPerspectiveDiceSixFacesThree
                                    size={29}
                                    color="#fff"
                                />
                            }>
                            <CreateGame />
                        </Box>
                        <div className="height-[220px] border-l-[3px] border-gray-400 opacity-25"></div>
                    </div>
                    <div className="flex flex-col justify-between w-[460px]">
                        <Box
                            title="Liste des parties"
                            icon={<FaList size={20} />}
                            offset="2">
                            <div className="flex-initial h-72 overflow-auto">
                                <GameList />
                            </div>
                        </Box>
                        <Box
                            title="Rejoindre une partie"
                            icon={<MdAddBox size={23} />}>
                            <div className="flex flex-row space-x-4 justify-center items-center">
                                <input
                                    type="text"
                                    id="code"
                                    className="bg-gray-200 text-gray-900 text-sm rounded-3xl block w-[200px] h-10 p-2.5"
                                    placeholder="XXXXX..."
                                    maxLength={5}
                                    onChange={(e) => setCodeToJoin(e.target.value)}
                                    value={codeToJoin.toUpperCase()}
                                    required
                                />
                                <button
                                    onClick={handleNavigate}
                                    className={`text-white bg-gradient-to-r from-yellow-500 to-yellow-300 w-[120px] h-10 rounded-3xl my-4 mx-auto`}>
                                    <div className="flex justify-center items-center">
                                        <span className="font-bold px-[5px]">
                                            Jouer !
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </Box>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
