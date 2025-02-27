import Hero from './Hero';
import Navbar from './Navbar';
import useGlobalErr from '../../hooks/useGlobalErr';
import { FaCircleInfo } from "react-icons/fa6";
import Rejoin from './Rejoin';

const Home = () => {
    const { globalErr } = useGlobalErr();

    return (
        <>
            <Navbar />
            <Hero />
            {globalErr ? (
                <div className="fixed bottom-0 -translate-x-[50%] left-[50%]">
                    <div
                        className="flex items-center z-50 p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-[#eddddd]"
                        role="alert">
                        <FaCircleInfo size={18} className="mr-3" />
                        <span className="sr-only">Info</span>
                        <div>
                            <span className="font-medium">Erreur :</span>{' '}
                            {globalErr}
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
            <Rejoin />
        </>
    );
};

export default Home;
