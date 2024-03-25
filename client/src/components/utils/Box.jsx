const Box = ({ title, icon, offset, children }) => {
    if (!offset) offset = 1;
    return (
        <div className="flex flex-col">
            <p
                className={`flex -mb-6 z-10 mx-auto w-[260px] h-10 bg-[#39324f] justify-center items-center rounded-3xl shadow-lg`}
            >
                {icon}
                <span className={`font-bold text-[20px] px-${offset}`}>
                    {title}
                </span>
            </p>
            <div className="block p-6 bg-[#2d2840] rounded-lg overflow-visible shadow-3xl">
                {children}
            </div>
        </div>
    );
};

export default Box;
