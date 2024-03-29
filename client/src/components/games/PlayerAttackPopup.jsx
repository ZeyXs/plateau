import React, { useEffect, useState } from 'react';
import Cards from './Cards';
import useAuth from '../../hooks/useAuth';
import useGame from '../../hooks/useGame';
import { FaLock } from 'react-icons/fa';

const PlayerAttackPopup = ({ cardValue, playersData, setShowAttackPopup, selectedPlayer, setSelectedPlayer, setCanPlay, setCanThrow }) => {

  const { auth } = useAuth();
  const { players, emit } = useGame();

  const [confirmDisabled, setConfirmDisabled] = useState(true);

  const handleCancel = () => {
    // Reset selection
    setSelectedPlayer(
      Object.keys(playersData).filter(
          selectedPlayer => selectedPlayer != auth.id,
      )[0],
    );
    setCanPlay(true);
    setCanThrow(true);
    setShowAttackPopup(false);
  }

  const handleConfirm = () => {
    emit('client.playedCard', {
      selectedCard: cardValue,
      action: "USE",
      targetId: selectedPlayer,
    });
    setShowAttackPopup(false);
  }

  
  const handleSelect = (playerId) => {
    if (playerId !== selectedPlayer && !playersData[playerId].malus.includes(cardValue)) {
      setSelectedPlayer(player);
    }
  }
  
  useEffect(() => {
    if (!playersData[selectedPlayer].malus.includes(cardValue)) {
      setConfirmDisabled(false);
    }
  }, [selectedPlayer]);

  return (
    <div className="relative">
        <div className="absolute flex items-center justify-center backdrop-blur-[2px] bg-black w-full h-[96vh] bg-opacity-50 z-[100]">
            <div className="flex flex-col space-y-10">
              <p>Choisissez un joueur à <span className="text-red-500 font-bold">attaquer</span> !</p>
              
              <div className="flex flex-row space-x-5 items-center justify-center">
                {Object.keys(players).map((player, index) => (
                  player !== auth.id && (
                    <div key={index} onClick={() => handleSelect(player)} className={`relative flex flex-col items-center justify-center p-2 rounded-lg space-y-2 cursor-pointer ${selectedPlayer && !playersData[player].malus.includes(cardValue) ? "border-red-500 border-2 bg-red-500 bg-opacity-35 hover:bg-opacity-25" : "hover:bg-white hover:bg-opacity-25"} ${playersData[player].malus.includes(cardValue) && "border-gray-500 border-2 bg-gray-500 bg-opacity-35 hover:bg-opacity-25"}`}>
                      <img src={players[player].profilePicture} alt="avatar" className={`w-16 h-16 rounded-full object-cover`} />
                      <div className='flex flex-row space-x-1 items-center'>
                        {playersData[player].malus.includes(cardValue) && <FaLock size={18} />}
                        <p className="text-gray-200 text-lg">{players[player].username}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="flex flex-row space-x-10 items-center justify-center text-xl">
                <button onClick={handleConfirm} className="bg-[#7fb352] hover:bg-[#93cc60] disabled:bg-[#8e8e8e] p-2 px-3 rounded-lg transition ease-in-out" disabled={confirmDisabled}>Confirmer</button>
                <button onClick={handleCancel} className="bg-[#c62d2d] hover:bg-[#e25454] p-2 px-3 rounded-lg transition ease-in-out">Annuler</button>
              </div>
            </div>
        </div>
    </div>
  );
};

export default PlayerAttackPopup;