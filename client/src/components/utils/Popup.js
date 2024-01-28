import { FaInfoCircle } from "react-icons/fa";

const Popup = ({ children }) => {
    return (
        <div className="flex flex-col bg-[#0e0e14] bg-opacity-[98%] rounded-lg w-64 px-3 py-2 text-sm">
            <FaInfoCircle size={15} />
            <span className="mt-1">{children}</span>
        </div>
    );
};

export default Popup;
