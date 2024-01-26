import { useEffect, useState } from 'react';
import axios from '../../api/axios';

const GameList = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [gameList, setGameList] = useState([]);
    const [playerList, setPlayerList] = useState(new Map());

    useEffect(() => {
        let games;
        const fetchGameData = async () => {
            try {
                const response = await axios.get(`/api/game`);
                games = response?.data;
            } catch(err) {
                console.log("[GameList.js] Warning: Failed to fetch game list from API.")
                setGameList([]);
            } finally {
                setGameList(games);
                if(games) for(let game of games) {
                    let players;
                    try {
                        console.log(`Fetching data from '/api/game/${game.code}/players'...`);
                        const response2 = await axios.get(`/api/game/${game.code}/players`);
                        players = response2?.data;
                    } catch(err) {
                        console.log("[GameList.js] Warning: Failed to fetch player list from API.")
                        players = null;
                    } finally {
                        console.log(game.code);
                        console.log(players);
                        setPlayerList(map => new Map(map.set(game.code,players)));
                    }
                }
                setIsLoading(false);
            }
        }
        fetchGameData();
        
    }, []);

    //useEffect(() => {
    //    console.log(gameList); // Néanmoins là, la requête axios est finie, car on print gameList dès lors qu'elle est modifiée (d'où le useEffect)
    //}, [gameList]);


    return (

        isLoading ? <h1>Chargement en cours...</h1> :
        !gameList ? <p>Impossible d'accéder à la liste des parties en cours (API_CURRENTLY_UNAVAILABLE)</p> :
        <>
            <section id="gamelist">
                {gameList.map((game) => (
                    game.gameState == "IN_LOBBY" ?
                    <div>
                        <a style={{textDecoration: 'none'}} href={'/game/'+game.code}>
                            <p>
                                <b>{game.title}</b><br/>
                                <i>{game.gameType}</i>
                            </p>
                            <hr/>
                            <p>{Object.keys(game.players).length}/{game.size}</p>
                            {Object.entries(playerList.get(game.code)).map((player) => (
                                <img src={player[1]} title={player[0]} width='30' height='30'/>
                            ))}
                        </a>
                    <br/>
                    </div>
                    : <></>
                ))}
            </section>
        </>



    );

}

export default GameList;