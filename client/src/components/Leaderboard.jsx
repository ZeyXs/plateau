import { useEffect, useState } from "react";
import axios from "../api/axios";


const GAME_TYPES = {
    ANY: "Tous confondus",
    BATAILLE: "Bataille",
    S6Q: "Six Qui Prend",
    MILLE_BORNES: "Mille Bornes"
}

const GAMETYPE_TO_KEY = {
    [GAME_TYPES.ANY]: "global",
    [GAME_TYPES.BATAILLE]: "bataille",
    [GAME_TYPES.S6Q]: "sixQuiPrend",
    [GAME_TYPES.MILLE_BORNES]: "milleBornes"
}

const FILTERS = {
    WINS: "Victoires",
    LOSES: "Défaites",
    TIMES_PLAYED: "Nombre de parties jouées",
    RATIO: "Ratio Victoires/Défaites"
}

const FILTER_TO_KEY = {
    [FILTERS.WINS]: "wins",
    [FILTERS.LOSES]: "loses",
    [FILTERS.TIMES_PLAYED]: "gamesPlayed",
    [FILTERS.RATIO]: "ratio"
}

const TABLE_COLUMNS = {
    [FILTERS.WINS]: ["Classement","Nom d'utilisateur","Victoire(s)","Défaite(s)","Partie(s) jouée(s)","Ratio Victoires/Défaites"],
    [FILTERS.LOSES]: ["Classement","Nom d'utilisateur","Défaite(s)","Victoire(s)","Partie(s) jouée(s)","Ratio Victoires/Défaites"],
    [FILTERS.TIMES_PLAYED]: ["Classement","Nom d'utilisateur","Partie(s) jouée(s)","Victoire(s)","Défaite(s)","Ratio Victoires/Défaites"],
    [FILTERS.RATIO]: ["Classement","Nom d'utilisateur","Ratio Victoires/Défaites","Victoire(s)","Défaite(s)","Partie(s) jouée(s)"]
}

const TABLE_KEYS = {
    [FILTERS.WINS]: ["wins","loses","gamesPlayed","ratio"],
    [FILTERS.LOSES]: ["loses","wins","gamesPlayed","ratio"],
    [FILTERS.TIMES_PLAYED]: ["gamesPlayed","wins","loses","ratio"],
    [FILTERS.RATIO]: ["ratio","wins","loses","gamesPlayed"]
}


const Leaderboard = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [category, setCategory] = useState(GAME_TYPES.ANY);
    const [filter, setFilter] = useState(FILTERS.WINS);
    const [players, setPlayers] = useState([]);

    const fetchPlayers = async () => {
        let playerList;
        try {
            const response = await axios.get("/api/user/");
            playerList = response?.data;
        } catch(err) {
            if(!err?.message) console.log("[Leaderboard.js] Warning: Failed to fetch user data from API. (API_UNAVAILABLE)");
            else console.log(err?.message);
            playerList = [];
        } finally {
            for(let player of playerList) {
                let winsAny = 0; let losesAny = 0;
                let gamesPlayedAny = 0; let ratioAny;
                for(const statCat of Object.keys(player.stats)) {
                    let winsTmp = player.stats[statCat]?.wins;
                    let losesTmp = player.stats[statCat]?.loses; 
                    let gamesPlayedTmp = player.stats[statCat]?.gamesPlayed;

                    let ratioTmp = parseInt((100 * winsTmp / gamesPlayedTmp).toFixed(1));
                    if(Number.isNaN(ratioTmp)) ratioTmp = 0.0;

                    player.stats[statCat]["ratio"] = ratioTmp;

                    winsAny += winsTmp;
                    losesAny += losesTmp;
                    gamesPlayedAny += gamesPlayedTmp;
                }
                ratioAny = parseInt((100 * winsAny / gamesPlayedAny).toFixed(1));
                if(Number.isNaN(ratioAny)) ratioAny = 0.0;

                player.stats["global"] = {
                    "wins": winsAny,
                    "loses": losesAny,
                    "gamesPlayed": gamesPlayedAny,
                    "ratio": ratioAny
                };
            }
            setPlayers(playerList);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPlayers();
    }, []);

    useEffect(() => {
        if(players.length != 0) {
            console.log("PLAYERS", players);
            let gameType = GAMETYPE_TO_KEY[category];
            let attr = FILTER_TO_KEY[filter];
            setLeaderboard(players.toSorted((a,b) => a.stats[gameType][attr] - b.stats[gameType][attr]).toReversed());
        }
    }, [category, filter, players])



    return (
        <>
            <select id="cat_select" onChange={() => setCategory(document.getElementById("cat_select").value)}>
                {Object.values(GAME_TYPES).map((cat) => <option>{cat}</option>)}
            </select>
            <select id="filter_select" onChange={() => setFilter(document.getElementById("filter_select").value)}>
                {Object.values(FILTERS).map((filter) => <option>{filter}</option>)}
            </select>

            <div className="text-white">
                {isLoading ?
                    <p>Chargement en cours...</p>
                :
                    <>
                        <table>
                            <tr>
                                {TABLE_COLUMNS[filter].map(column => <th>{column}</th>)}
                            </tr>
                            {leaderboard.map((player, i) => <tr>
                                <td>#{i+1}</td>
                                <td>{player.username}</td>
                                {TABLE_KEYS[filter].map(key =>
                                    (key != "ratio") ?
                                        <td>{player.stats[GAMETYPE_TO_KEY[category]][key]}</td>
                                    :
                                        <td>{player.stats[GAMETYPE_TO_KEY[category]][key]}%</td>
                                )}
                            </tr>)}
                        </table>
                    </>
                }
            </div>
        </>
        
    );
}

export default Leaderboard;