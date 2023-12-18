import { useParams } from "react-router-dom";

const Game = () => {
    const { code } = useParams();

    return (
        <div className="flex h-[100vh] justify-center items-center text-white text-3xl">
            code = {code}
        </div>
    );
};

export default Game;
