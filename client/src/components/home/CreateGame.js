import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import GameType from "./GameType";

const GAME_LIST = ["Bataille"];

const GAMETYPE_BG = {
    bataille: "https://media.istockphoto.com/id/952007312/vector/card-games-flat-design-western-icon.jpg?s=612x612&w=0&k=20&c=Y2b2g4eZrP0Wy6B5lIcdJhkTZxVlXzRewjPrhdh5vms=",
    sixQuiPrend: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDgH2y1CyTijygIXQZpiU5j-Pa3C5U9nclZDuQeTws2uztC30Uocb-hLI7cdqTUqSQsSY&usqp=CAU",
    milleBornes: "data:image/png;base64,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",
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
                console.log(err);
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
