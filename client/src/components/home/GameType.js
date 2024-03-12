const GameType = ({ type, title, isSelected, handleGameType }) => {
    return (
        <div onClick={() => handleGameType(type)} className={`rounded-lg border-2 ${isSelected ? 'border-red-500' : 'border-white'} relative overflow-hidden`}>
            <img src="https://media.istockphoto.com/id/952007312/vector/card-games-flat-design-western-icon.jpg?s=612x612&w=0&k=20&c=Y2b2g4eZrP0Wy6B5lIcdJhkTZxVlXzRewjPrhdh5vms=" className="rounded-lg h-[70px] w-[110px] object-cover" />
            <div className="absolute box-content bottom-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100">{title}</div>
        </div>
    );
};

export default GameType;