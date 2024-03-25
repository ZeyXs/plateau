import { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { FcLock, FcUnlock } from 'react-icons/fc';

const ToggleButton = ({ label }) => {
    const [isPrivate, setIsPrivate] = useState(false);

    const handleCheckboxChange = () => {
        setIsPrivate(!isPrivate);
    };

    return (
        <label className="flex cursor-pointer select-none items-center">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
                />
                <div className="block h-8 w-14 rounded-full bg-[#E5E7EB]"></div>
                <div className="dot absolute left-[0.14rem] top-[0.16rem] flex h-7 w-7 items-center justify-center rounded-full bg-white transition peer-checked:translate-x-6 peer-checked:bg-blue-500">
                    {isPrivate ? (
                        <span className="active">
                            <FcLock color="white" />
                        </span>
                    ) : (
                        <span className="inactive text-body-color">
                            <FcUnlock color="black" />
                        </span>
                    )}
                </div>
            </div>
        </label>
    );
};

export default ToggleButton;
