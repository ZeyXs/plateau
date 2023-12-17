import { AiOutlineClose } from 'react-icons/ai';

const Popup = ({ title, visible, children }) => {
    if (!visible) return null;
    else
        return (
            <div className="flex fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] justify-center items-center z-20">
                <div className="flex-col bg-[#1b1b2b] p-2 rounded-xl">
                    <div class="flex items-center justify-between space-x-4 p-2 border-b rounded-t border-gray-200">
                        <h3 class="font-semibold text-gray-200">{title}</h3>
                        <button
                            type="button"
                            class="text-gray-400 bg-transparent hover:bg-[#2b2b43] hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="default-modal">
                            <AiOutlineClose size={18} />
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="mt-2">{children}</div>
                </div>
            </div>
        );
};

export default Popup;
