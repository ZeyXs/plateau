import ItemImgList from "./ItemImgList";

const CreateGame = () => {

    const gameList = [
        {"nom":"Bataille", "lienImage":"<lien_image_bataille>"},
        {"nom":"Uno", "lienImage":"<lien_image_uno>"}
    ]

    return (
        <div className="createGame">
            <label>Nom de la partie :</label>
            <br/>
            <input id="gameName" type="text" maxLength="20"/>
            <br/>
            <label>Type de jeu :</label>
            <br/>
            <ItemImgList idList="gameList" items={gameList}/>
            <br/>
            <label>Nombre de joueurs :</label>
            <br/>
            <input id="maxPlayerNumber" type="number" min="2" max="10" defaultValue="2"/>
            <br/>
            <button>Créer la partie !</button>


        </div>
    );
}

export default CreateGame;