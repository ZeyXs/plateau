import { GiPerspectiveDiceSixFacesThree } from 'react-icons/gi';
import Box from './Box';
import { FaList } from 'react-icons/fa6';
import { MdAddBox } from 'react-icons/md';

const Hero = () => {
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
                            <div className="px-40 py-[240px]"></div>
                        </Box>
                        <div className="height-[220px] border-l-[3px] border-gray-400 opacity-25"></div>
                    </div>
                    <div className="flex flex-col justify-between">
                        <Box
                            title="Liste des parties"
                            icon={<FaList size={20} />}
                            offset="2">
                            <div className="px-[200px] py-[160px]"></div>
                        </Box>
                        <Box
                            title="Rejoindre une partie"
                            icon={<MdAddBox size={23} />}>
                            <div className="flex flex-row space-x-4 justify-center items-center">
                                <input
                                    type="text"
                                    id="code"
                                    class="bg-gray-200 text-gray-900 text-sm rounded-3xl block w-[200px] h-10 p-2.5"
                                    placeholder="ZAPJ..."
                                    required
                                />
                                <button
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
