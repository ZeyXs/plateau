import { useParams } from "react-router-dom";

const Game = () => {

    const { code } = useParams();

    return (
        <h1>code = {code}</h1>
    );
};

export default Game;