import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import useSocket from '../../hooks/useSocket';

const gameImg = {
    Bataille:
        'https://media.istockphoto.com/id/1219076346/vector/playing-cards-flat.jpg?s=170667a&w=0&k=20&c=TcWdRZkaXQOmni5_-DRNPpAmc46-XLYqzvZvcVtOSgA=',
    SixQuiPrend:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsemyHkoEfs5lGFn5wMFX-TcPHGXniysKxvQ&usqp=CAU',
};

const GameList = () => {
    const socket = useSocket();
    const [isLoading, setIsLoading] = useState(true);
    const [gameList, setGameList] = useState([]);
    const [playerList, setPlayerList] = useState(new Map());

    const fetchGameData = async () => {
        let games;
        try {
            const response = await axios.get(`/api/game/`);
            games = response?.data;
        } catch (err) {
            console.log(
                '[GameList.js] Warning: Failed to fetch game list from API.',
            );
            setGameList([]);
        } finally {
            if (games)
                for (let game of games) {
                    let players;
                    try {
                        const response2 = await axios.get(
                            `/api/game/${game.code}/players`,
                        );
                        players = response2?.data;
                    } catch (err) {
                        console.log(
                            '[GameList.js] Warning: Failed to fetch player list from API.',
                        );
                        players = null;
                    } finally {
                        setPlayerList(
                            map => new Map(map.set(game.code, players)),
                        );
                    }
                }
            games = games.filter(game => game.isPrivate === false);
            setGameList(games);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGameData();
    }, []);

    useEffect(() => {
        const handleRefreshGameList = () => {
            setTimeout(() => {
                fetchGameData();
            }, 1000);
        };

        // Listen for the "server.refreshGameList" event and call handleRefreshGameList
        socket.on('server.refreshGameList', handleRefreshGameList);
    }, [socket]);

    return isLoading ? (
        <h1>Chargement en cours...</h1>
    ) : !gameList && !playerList ? (
        <p>
            Impossible d'accéder à la liste des parties en cours
            (API_CURRENTLY_UNAVAILABLE)
        </p>
    ) : (
        <div className="flex flex-col p-2 mt-2 space-y-3">
            {gameList.map((game, i) =>
                game.gameState == 'IN_LOBBY' ? (
                    <a
                        key={i}
                        href={'/game/' + game.code}
                        className="flex w-full bg-[#231f31] h-20 rounded-lg outline-gray-400 outline outline-0 hover:outline-2 truncate">
                        <img
                            src={gameImg[game.gameType]}
                            className="flex-initial w-28 object-cover rounded-l-lg"
                        />
                        <div className="flex flex-col ml-2 justify-evenly w-full">
                            <span className="font-bold whitespace-nowrap text-left">
                                {game.title}
                            </span>
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex -space-x-2 rtl:space-x-reverse">
                                    {playerList.get(game.code) &&
                                        typeof playerList.get(game.code) ===
                                            'object' &&
                                        Object.entries(
                                            playerList.get(game.code) || {},
                                        ).map((player, j) => (
                                            <img
                                                key={j}
                                                title={player[0]}
                                                className="w-7 h-7 border-[1px] border-white rounded-full"
                                                src={player[1]}
                                            />
                                        ))}
                                </div>
                                <div className="bg-[#1a1724] mr-3 rounded-xl px-4 py-1">
                                    {game.players &&
                                    typeof game.players === 'object'
                                        ? Object.keys(game.players).length
                                        : 0}
                                    /{game.size}
                                </div>
                            </div>
                        </div>
                    </a>
                ) : (
                    <div key={i} className="hidden"></div>
                ),
            )}
        </div>
    );
};

export default GameList;
