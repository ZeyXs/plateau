import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

const GAME_LIST = ["Bataille"];

const CreateGame = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

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
                const response = await axios.post(
                    "/api/game",
                    JSON.stringify({
                        title: gameTitle,
                        size: gameSize,
                        gameType: gameType,
                    }),
                    {
                        headers: {
                            Authorization: `Bearer ${auth.accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                setGameTitle("");
                setGameType("Bataille");
                setGameSize(2);
                const gameCode = response.data.code;
                navigate(`/game/${gameCode}`, { replace: true });
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

    return (
        <div className="p-2 border border-red-600">
            {/* Affichage message d'erreur */}
            <p
                className={setErrMessage ? "errmessage" : "offscreen"}
                aria-live="assertive"
            >
                {errMessage}
            </p>

            <form onSubmit={handleGameCreation} className="flex flex-col">
                {/* _____ Champ nom de la partie _____ */}
                <label htmlFor="title">Nom de la partie :</label>
                <br />
                <input
                    type="text"
                    className="text-black"
                    id="title"
                    autoComplete="off"
                    onChange={(e) => setGameTitle(e.target.value)}
                    value={gameTitle}
                    maxLength="30"
                    required
                />

                {/* _____ Champ type de jeu _____ */}
                <label htmlFor="game_type">Type de jeu :</label>
                <br />
                <select
                    id="game_type"
                    onChange={(e) => setGameType(e.target.value)}
                    className="text-black"
                    value={gameType}
                    required
                >
                    {GAME_LIST.map((gameT, i) => (
                        <option key={i}>{gameT}</option>
                    ))}
                </select>

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
