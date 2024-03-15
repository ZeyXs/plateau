import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import GameType from "./GameType";
import MilleBornesBg from "../../assets/millebornes.png";

const GAME_LIST = ["Bataille"];

const GAMETYPE_BG = {
    bataille: "https://media.istockphoto.com/id/952007312/vector/card-games-flat-design-western-icon.jpg?s=612x612&w=0&k=20&c=Y2b2g4eZrP0Wy6B5lIcdJhkTZxVlXzRewjPrhdh5vms=",
    sixQuiPrend: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDgH2y1CyTijygIXQZpiU5j-Pa3C5U9nclZDuQeTws2uztC30Uocb-hLI7cdqTUqSQsSY&usqp=CAU",
    milleBornes: MilleBornesBg,
}

const CreateGame = () => {

    const { auth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    
    // Variables champs de saisie
    const [gameTitle, setGameTitle] = useState("");
    const [gameType, setGameType] = useState("Bataille");
    const [gameSize, setGameSize] = useState(2);

    // Variable message d'erreur
    const [errMessage, setErrMessage] = useState("");

    // Suppression du message d'erreur lors de la modification d'un des champs de saisie
    useEffect(() => {
        setErrMessage("");
    }, [gameTitle, gameType, gameSize]);

    const handleGameCreation = async (e) => {
        e.preventDefault();
        if (!auth?.accessToken)
            setErrMessage(
                "Vous devez être connecté pour pouvoir créer une partie"
            );
        else {
            try {
                const response = await axiosPrivate.post(
                    "/api/game",
                    JSON.stringify({
                        title: gameTitle,
                        size: gameSize,
                        gameType: gameType,
                    })
                );
                setGameTitle("");
                setGameType("Bataille");
                setGameSize(2);
                const gameCode = response.data.code;
                navigate(`/game/${gameCode}`, { replace: true });
                //socket.emit("client.refreshGameList");
            } catch (err) {
                if (!err?.response) setErrMessage("Pas de réponse du serveur");
                else if (err.response?.status === 400)
                    setErrMessage(
                        "Veuillez renseigner tous les champs avant de soumettre la création d'une partie"
                    );
                else if (err.response?.status === 401)
                    setErrMessage(
                        "Vous devez être connecté pour pouvoir créer une partie"
                    );
                else setErrMessage("Connexion échouée");
            }
        }
    };

    const handleGameType = (type) => {
        setGameType(type);
    }

    return (
        <div className="p-4 ">
            {/* Affichage message d'erreur */}
            <p
                className={setErrMessage ? "errmessage" : "offscreen"}
                aria-live="assertive"
            >
                {errMessage}
            </p>

            <form onSubmit={handleGameCreation} className="flex flex-col space-y-5">
                {/* _____ Champ nom de la partie _____ */}
                <input
                    type="text"
                    id="title"
                    className="bg-gray-200 text-gray-900 text-sm rounded-3xl block w-full h-10 ps-4"
                    placeholder="Nom de la partie"
                    onChange={(e) => setGameTitle(e.target.value)}
                    value={gameTitle}
                    maxLength="30"
                    autoComplete="off"
                    required
                />

                {/* _____ Champ type de jeu _____ */}
                <div className="flex flex-row justify-between space-x-3">
                    <GameType type="Bataille" title="Bataille" isSelected={gameType === "Bataille"} handleGameType={handleGameType} bgUrl={GAMETYPE_BG.bataille} />
                    <GameType type="SixQuiPrend" title="6 qui prend !" isSelected={gameType === "SixQuiPrend"} handleGameType={handleGameType} bgUrl={GAMETYPE_BG.sixQuiPrend} />
                    <GameType type="MilleBornes" title="Mille bornes" isSelected={gameType === "MilleBornes"} handleGameType={handleGameType} bgUrl={GAMETYPE_BG.milleBornes} />
                </div>

                {/* _____ Champ nombre de joueurs max _____ */}
                <label htmlFor="game_size">Nombre de joueurs maximum :</label>
                <br />
                <input
                    type="number"
                    id="game_size"
                    autoComplete="off"
                    className="text-black"
                    onChange={(e) => setGameSize(e.target.value)}
                    value={gameSize}
                    min="2"
                    max="8"
                    required
                />


                <button type="submit">Créer la partie !</button>
            </form>
        </div>
    );
};

export default CreateGame;
