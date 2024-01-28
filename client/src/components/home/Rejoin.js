import { FaCircleInfo } from 'react-icons/fa6';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Rejoin = () => {
    const codeToRejoin = localStorage.getItem('brutallyLeft') || '';
    const [isVisible, setIsVisible] = useState(!!codeToRejoin);
    const navigate = useNavigate();

    const acceptReconnect = () => {
        localStorage.removeItem('brutallyLeft');
        navigate(`/game/${codeToRejoin}`, { replace: true });
    };

    const refuseReconnect = () => {
        setIsVisible(false);
        localStorage.removeItem('brutallyLeft');
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 -translate-x-[50%] left-[50%]">
            <div
                className="flex items-center z-50 p-4 mb-4 text-sm text-purple-900 border border-purple-600 rounded-lg bg-[#ae7ec9]"
                role="alert">
                <FaCircleInfo size={18} className="mr-3" />
                <span className="sr-only">Info</span>
                <div>
                    Souhaitez-vous rejoindre la dernière partie que vous avez
                    quittée ?
                </div>
                <button onClick={acceptReconnect}>Oui</button>
                <button onClick={refuseReconnect}>Non</button>
            </div>
        </div>
    );
};

export default Rejoin;
