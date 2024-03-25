const MilleBornes = () => {

    const socket = useSocket();
    const {
        code,
        gameTitle,
        setGameTitle,
        gameType,
        setGameType,
        gameState,
        setGameState,
        chat,
        setChat,
        playerNumber,
        setPlayerNumber,
        socketEmit
    } = useGame();

    return (
        <div>
            {/* Your component code here */}
        </div>
    );
};

export default MilleBornes;
