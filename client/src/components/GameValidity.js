import { useLocation, Navigate, useParams, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";
import useErr from "../hooks/useGlobalErr";

const GameValidity = () => {
    
    const [isLoading, setIsLoading] = useState(true);
    const { auth } = useAuth();
    const { setGlobalErr } = useErr();
    const { code } = useParams();
    const location = useLocation();

    const [validEntry, setValidEntry] = useState(false);

    useEffect(() => {

        let gameData, playerData;

        const getGameData = async () => {
            let errorFlags = [];

            try {
                console.log(`Code de la partie : ${code}`);
                const response = await axios.get(`/api/game/${code}`);
                gameData = response.data;
            } catch(err) {
                // Serveur offline
                if(!err?.message) errorFlags.push("SD_FLAG");
                // Partie inexistante
                else if(err.response?.status == 404) errorFlags.push("GNF_FLAG");
            } finally {
                // Partie terminée
                if(gameData?.gameState == "ENDED") errorFlags.push("GAE_FLAG");
                // Partie commencée
                else if(gameData?.gameState == "IN_GAME") errorFlags.push("GAS_FLAG");
                // Partie pleine
                else if(!errorFlags.includes("GNF_FLAG") && gameData?.size == Object.keys(gameData?.players).length) {
                    errorFlags.push("GIF_FLAG");
                }

                try {
                    const response = await axios.get(`/api/game/${code}/${auth.user}`);
                    playerData = response.data;
                } catch(err) {
                    // Serveur offline
                    if(!err?.message) errorFlags.push("SD_FLAG");
                    // Joueur déjà présent
                    else if(err.response?.status == 404) errorFlags.push("!PAC_FLAG");
                    
                } finally {

                    if(!errorFlags.includes("!PAC_FLAG")) errorFlags.push("PAC_FLAG");
                    else {
                        let filtered = errorFlags.filter((flag) => flag != "!PAC_FLAG");
                        errorFlags = filtered;
                    }

                    console.log(errorFlags);

                    if(errorFlags.length != 0) {
                        let mainError = errorFlags[0];
                        switch(mainError) {
                            case "SD_FLAG":
                                setGlobalErr("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.");
                                break;
                            case "GNF_FLAG":
                                setGlobalErr("La partie que vous avez essayé de rejoindre n'existe pas.");
                                break;
                            case "GAE_FLAG":
                                setGlobalErr("La partie que vous avez essayé de rejoindre est terminée.");
                                break;
                            case "GAS_FLAG":
                                setGlobalErr("La partie que vous avez essayé de rejoindre a déjà commencé.");
                                break;
                            case "GIF_FLAG":
                                setGlobalErr("La partie que vous avez essayé de rejoindre est déjà pleine.");
                                break;
                            case "PAC_FLAG":
                                setGlobalErr("Vous êtes déjà présent dans la partie.");
                                break;
                            default:
                                break;
                        }
                        setValidEntry(false);
                    } else setValidEntry(true);

                    console.log(`[GameValidity.js] ${validEntry}`);

                    setIsLoading(false);

                }
            }
        }

        getGameData();

    }, []);

    
    console.log(`[test debug en dehors useEffect] ${validEntry}`);
    return (
        
        isLoading ? <h1>Chargement en cours...</h1> :
        (!validEntry ? <Navigate to="/" state={{ from: location }} replace /> : <Outlet/>)

    );

};

export default GameValidity;