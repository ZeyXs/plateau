// WIP - Not working

import axios from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const GameList = async () => {
    const axiosPrivate = useAxiosPrivate();

    try {
        await axios.get("/api/game").then((res) => console.log(res));
    } catch (err) {
        console.log(err);
    }

    return <div className="p-2 border border-red-600">GameList</div>;
};

export default GameList;
