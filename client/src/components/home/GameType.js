const GameType = ({ type, title, isSelected, handleGameType, bgUrl }) => {
    return (
        <div onClick={() => handleGameType(type)} className={`rounded-lg z-10 border-spacing-0 border-[3px] ${isSelected ? 'border-purple-500' : 'border-white'} relative overflow-hidden cursor-pointer`}>
            <img src={bgUrl} className="h-[70px] w-[110px] object-cover" />
            <div className="absolute box-content bottom-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center text-white font-bold opacity-0 transition-opacity duration-200 ease-in-out hover:opacity-100">{title}</div>
        </div>
    );
};

export default GameType;