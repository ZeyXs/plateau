import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import GameType from './GameType';
import MilleBornesBg from '../../assets/millebornes.png';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { IoPersonAddSharp } from "react-icons/io5";
import { FaUnlock,FaLock } from "react-icons/fa6";

const GAMETYPE_BG = {
    bataille:
        'https://media.istockphoto.com/id/952007312/vector/card-games-flat-design-western-icon.jpg?s=612x612&w=0&k=20&c=Y2b2g4eZrP0Wy6B5lIcdJhkTZxVlXzRewjPrhdh5vms=',
    sixQuiPrend:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDgH2y1CyTijygIXQZpiU5j-Pa3C5U9nclZDuQeTws2uztC30Uocb-hLI7cdqTUqSQsSY&usqp=CAU',
    milleBornes: MilleBornesBg,
};

const CreateGame = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    // Variables champs de saisie
    const [gameTitle, setGameTitle] = useState('');
    const [gameType, setGameType] = useState('Bataille');
    const [gameSize, setGameSize] = useState(2);
    const [isPrivate, setIsPrivate] = useState(false);

    // Variable message d'erreur
    const [errMessage, setErrMessage] = useState('');

    // Suppression du message d'erreur lors de la modification d'un des champs de saisie
    useEffect(() => {
        setErrMessage('');
    }, [gameTitle, gameType, gameSize, isPrivate]);

    const handleGameCreation = async e => {
        e.preventDefault();
        if (!auth?.accessToken)
            setErrMessage(
                'Vous devez être connecté pour pouvoir créer une partie',
            );
        else {
            try {
                const response = await axiosPrivate.post(
                    '/api/game',
                    JSON.stringify({
                        title: gameTitle,
                        size: gameSize,
                        gameType: gameType,
                        isPrivate: isPrivate,
                    }),
                );
                setGameTitle('');
                setGameType('Bataille');
                setGameSize(2);
                const gameCode = response.data.code;
                navigate(`/game/${gameCode}`, { replace: true });
                //socket.emit("client.refreshGameList");
            } catch (err) {
                if (!err?.response) setErrMessage('Pas de réponse du serveur');
                else if (err.response?.status === 400)
                    setErrMessage(
                        "Veuillez renseigner tous les champs avant de soumettre la création d'une partie",
                    );
                else if (err.response?.status === 401)
                    setErrMessage(
                        'Vous devez être connecté pour pouvoir créer une partie',
                    );
                else setErrMessage('Connexion échouée');
            }
        }
    };

    const handleGameType = type => {
        setGameType(type);
    };

    return (
        <div className="p-4">
            {/* Affichage message d'erreur */}
            <p
                className={setErrMessage ? 'errmessage' : 'offscreen'}
                aria-live="assertive">
                {errMessage}
            </p>

            <form
                onSubmit={handleGameCreation}
                className="flex flex-col space-y-6 pt-6">
                {/* _____ Champ nom de la partie _____ */}
                <input
                    type="text"
                    id="title"
                    className="bg-gray-200 text-gray-900 text-sm font-bold rounded-3xl block w-full h-10 ps-4"
                    placeholder="Nom de la partie"
                    onChange={e => setGameTitle(e.target.value)}
                    value={gameTitle}
                    maxLength="30"
                    autoComplete="off"
                    required
                />

                {/* _____ Champ type de jeu _____ */}
                <div className="flex flex-row justify-between space-x-3 pt-4">
                    <GameType
                        type="Bataille"
                        title="Bataille"
                        isSelected={gameType === 'Bataille'}
                        handleGameType={handleGameType}
                        bgUrl={GAMETYPE_BG.bataille}
                    />
                    <GameType
                        type="SixQuiPrend"
                        title="6 qui prend !"
                        isSelected={gameType === 'SixQuiPrend'}
                        handleGameType={handleGameType}
                        bgUrl={GAMETYPE_BG.sixQuiPrend}
                    />
                    <GameType
                        type="MilleBornes"
                        title="Mille bornes"
                        isSelected={gameType === 'MilleBornes'}
                        handleGameType={handleGameType}
                        bgUrl={GAMETYPE_BG.milleBornes}
                    />
                </div>

                {/* _____ Champ nombre de joueurs max _____ */}
                <div className="flex flex-row items-center space-x-5 pt-3">
                    <p className="flex flex-row items-center"><span className='pr-2'><IoPersonAddSharp size={20} /></span>Nombres de joueurs : </p>
                    <div className="relative flex items-center max-w-[8rem]">
                        <button
                            type="button"
                            onClick={() =>
                                setGameSize(prevValue =>
                                    prevValue > 2 ? prevValue - 1 : prevValue,
                                )
                            }
                            className="bg-[#4a4a5a] hover:bg-[#565668] rounded-s-3xl p-3 h-9">
                            <FaMinus size={12} color="lightgray" />
                        </button>
                        <span className="bg-[#5e5e71] px-4 h-9 flex justify-center items-center text-gray-200 font-bold text-sm w-full">
                            {gameSize}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setGameSize(prevValue =>
                                    prevValue < 8 ? prevValue + 1 : prevValue,
                                )
                            }
                            className="bg-[#4a4a5a] hover:bg-[#565668] rounded-e-3xl p-3 h-9">
                            <FaPlus size={12} color="lightgray" />
                        </button>
                    </div>
                </div>

                {/* _____ Champ partie privée _____ */}
                <div className="flex flex-row items-center space-x-5 pb-8">
                    <p className="flex flex-row items-center">
                        <span className='pr-2'>
                            {isPrivate ? <FaLock size={20} /> : <FaUnlock size={20} />}
                        </span>
                        Partie privée :
                    </p>
                    <label className="autoSaverSwitch relative inline-flex cursor-pointer select-none items-center">
                        <input
                            type="checkbox"
                            name="autoSaver"
                            className="sr-only"
                            checked={isPrivate}
                            onChange={() => setIsPrivate(!isPrivate)}
                        />
                        <span
                            className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${
                                isPrivate ? 'bg-[#bd89f2]' : 'bg-[#4a4a5a]'
                            }`}>
                            <span
                                className={`dot h-[18px] w-[18px] rounded-full bg-white duration-200 ${
                                    isPrivate ? 'translate-x-6' : ''
                                }`}></span>
                        </span>
                    </label>
                </div>

                {/* _____ Bouton de soumission _____ */}
                <button
                    type="submit"
                    className="text-white bg-gradient-to-r from-yellow-500 to-yellow-300 w-[200px] h-10 rounded-3xl mx-auto">
                    <div className="flex justify-center items-center">
                        <span className="font-bold px-[5px]">
                            Créer la partie !
                        </span>
                    </div>
                </button>
            </form>
        </div>
    );
};

export default CreateGame;
