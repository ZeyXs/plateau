import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useSocket from "../../hooks/useSocket";
import useGame from "../../hooks/useGame";
import { useNavigate } from "react-router-dom";

const SixQuiPrend = () => {

  const navigate = useNavigate();

  // _____ Utilisation de contextes _____
  const { auth } = useAuth();  
  const socket = useSocket();
  const {
    code,
    gameTitle,
    setGameTitle,
    gameType,
    setGameType,
    gameState,
    setGameState,
    chat,
    setChat,
    players,
    emit
  } = useGame();

   // _____ Variables de jeu _____
  const [hand, setHand] = useState([]);
  const [canPlay, setCanPlay] = useState(true);
  const [selectedCard, setSelectedCard] = useState();
  const [lines, setLines] = useState([]);
  const [playersData, setPlayersData] = useState({});
  const [canSelectLine, setCanSelectLine] = useState(false);
  const [selectedLine, setSelectedLine] = useState("0");
  const [scoreboard, setScoreboard] = useState({});

  // Tout ce qui est en dessous est à modifier et à vérifier

useEffect(() => {
  console.log("Prêt à recevoir des socket")
  
    socket.on("server.sendHand", (data) => {
      console.log("Receiving data...")
      setHand(data.hand)
      console.log("Data to start game received.")
    });

    socket.on("server.canPlayAgain", (lines) => {
      console.log("Receiving can play again signal...")
      setLines(lines);
      setCanPlay(true);
    });

    socket.on("server.cardsPlayed", (hands) => {
      console.log("Server send cards played this round")
      let handsList = {};
      for (let p in hands) {
        handsList[p] = hands[p];
      }
    });

    socket.on("server.requestToBuyALine", (data) => {
      console.log("Server request to select a line to buy...")
      let slines = data.lines;
      setLines(slines);
      setSelectedLine('0');
      setCanSelectLine(true);
    });

    socket.on("server.scoreboardChanged", (newScoreboard) => {
      console.log("Scoreboard updated.")
      console.log(newScoreboard)
      setScoreboard(newScoreboard);
    });
// A changer
    socket.on("server.sendGameData", (data) => {
      console.log("server.sendGameData");
      console.log(data);
      const sHand = data.hand;
      const sPlayersData = data.playersData;
      const sScoreboard = data.scoreboard;
      const sLines=data.lines
      const sCanPlay=data.canPlay;
      setCanPlay(sCanPlay);
      setHand(sHand);
      setLines(sLines);
      setPlayersData(sPlayersData);
      setScoreboard(sScoreboard);
      setSelectedCard(sHand[0]);
      console.log("selected card",selectedCard);
  });


    socket.on("server.gameEnded", (data) => {
      console.log("server.gameEnded");
      console.log(data);
      const sWinner = data.winner;
      const sFinalScoreboard = data.finalScoreboard;
      alert("Winner: " + sWinner + "\n" + JSON.stringify(sFinalScoreboard));
      navigate("/", { replace: true });
    });

    return () => {
      socket.off("server.startGame");
      socket.off("server.scoreboardChanged");
      socket.off("server.sendHand");
      socket.off("server.sendGameData");
      socket.off("server.canPlayAgain");
      socket.off("server.gameEnded");
      socket.off("server.leveledUp");
  };

  }, [socket]);


  const deleteCard=(card)=>{
    console.log("Deletion of cards")
    //console.log(hand);
    var cards=hand;
    for(let i in hand){
      //console.log("On est dans la boucle",card,cards[card],i);
      if (card==cards[i]){
        //console.log(cards[i]);
        cards.splice(i,1);
        //console.log("cards after deletion",cards);
        setHand(cards);
      }
    }
    console.log(hand);
  }

  const playCard = () => {
    if(canPlay) {
      //var cardToSend=selectedCard;
      console.log("Sending card:",selectedCard,"to server");
      deleteCard(selectedCard);
        emit("client.playedCard", {
            card: parseInt(selectedCard)
        });
        setSelectedCard(hand[0]);
    }
    setCanPlay(false);
}


  const sendLine = () => {
    if (canSelectLine) {
      emit("client.lineBought",{ lineNumber: parseInt(selectedLine)});
      setCanSelectLine(false);
      console.log("Line selected send to server")
    }
  };


// Le select des lignes ne fonctionne pas, à réparer
    return (
      <>
        <div className="bg-white text-black">
        
        <select id='card_select' value={selectedCard} onChange={() => setSelectedCard(document.getElementById("card_select").value)}>
                    {hand.map(card => <option value={card}>{card}</option>)}
        </select>
        {canPlay && (
        <button id="jouer-carte" onClick={playCard}>
          Jouer la carte
        </button>
        )}
        {canSelectLine && (
          <select
          name="line-selected"
          id="select-line"
          onChange={() => {
            setSelectedLine(document.getElementById("select-line").value);
          }}
          value={selectedLine}
        >
          {[1,2,3,4].map(i => <option value={i-1}>Ligne {i}</option>)}
        </select>)}
        {canSelectLine &&
        <button id="confirm-selected-line" onClick={sendLine}>
        Sélectionner la ligne
        </button>}
        {lines.map((line, i) => (
          <div key={i}>
            <p>
              <b>
              Ligne {i + 1}:
              </b>
            </p>
            <ul>
            {line.map((card, index) => (
              <li key={index}>{card}</li>
            ))}
          </ul>
        </div>
        ))}
         <div className="bg-[#45345f]">
                <p>Scoreboard :</p>
                <ul>
                    {Object.keys(scoreboard).map(playerId => <li>{playerId}. {scoreboard[playerId]}</li>)}
                </ul>
            </div>  
        </div>
  </>)
};

export default SixQuiPrend;