import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const ERROR_MSG = {
    SERVER_DOWN: "Pas de réponse du serveur. Réessayez plus tard.",
    NOT_AUTHENTIFICATED: "Vous devez être authentifié pour réaliser un achat.",
    NOT_ENOUGH_COINS: "Vous n'avez pas assez de pièces.",
    ALREADY_BOUGHT: "Vous possédez déjà cet objet.",
    ALREADY_EQUIPPED: "Vous avez déjà cet objet d'équipé.",
    NOT_EQUIPPED: "Vous avez pas cet objet d'équipé.",
    ITEM_NOT_FOUND: "L'objet acheté n'existe plus.",
    USER_NOT_FOUND: "L'utilisateur n'existe plus."
}

const Shop = () => {

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const location = useLocation();
    const [shop, setShop] = useState({});
    const [coins, setCoins] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [errorWhileLoading, setErrorWhileLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState();

    const fetchShopItems = async () => {
        // ___ Récupération des données de l'utilisateur ___
        let userItems;
        try {
            const response = await axios.get(`/api/user/${auth.user}`);
            userItems = response?.data.items;
            setCoins(response?.data.coins);
        } catch(err) {
            if(!err?.message) { 
                console.log("[Shop.js] Warning: Failed to fetch user data from API. (API_UNAVAILABLE)");
            } else if(err.response?.status == 404) console.log("[Shop.js] Warning: Failed to fetch user data from API. (USER_DOES_NOT_EXIST)");
            else console.log(err?.message);
            setErrorWhileLoading(true);
        } finally {
            if(userItems) {
                // ___ Récupération des données du shop ___
                let items;
                try {
                    const response = await axios.get("/user/items");
                    items = response?.data;
                } catch(err) {
                    if(!err?.message) console.log("[Shop.js] Warning: Failed to fetch shop data from API. (API_UNAVAILABLE)");
                    else console.log(err?.message);
                    setErrorWhileLoading(true);
                } finally {
                    let result = {};
                    if(items) {
                        // ___ Traitement des données ___
                        for(let uuid of Object.keys(userItems)) {
                            items[uuid].quantityOwned = userItems[uuid].amount;
                            items[uuid].equipped = userItems[uuid].equipped;
                        }
                        for(let uuid of Object.keys(items)) {
                            const itemCategory = items[uuid].category;
                            if(!Object.keys(result).includes(itemCategory)) {
                                // Si la catégorie n'existe déjà, on la rajoute
                                result[itemCategory] = [];
                            }
                            items[uuid].uuid = uuid;
                            delete items[uuid].category;
                            result[itemCategory].push(items[uuid]);
                        }
                        console.log(result);
                        setShop({...shop, ...result});
                    }
                }
            }
            setIsLoading(false);
        }
    }

    const handleBuy = async (uuid) => {
        let errorWhileBuying = false;
        try {
            console.log("sending")
            const response = await axiosPrivate.post(
                "/user/buy", {username: auth.user, itemBought: uuid}
            );
            console.log(response)
        } catch(err) {
            if(!err?.response) setErrorMsg(ERROR_MSG.SERVER_DOWN);
            else if(err.response?.status === 412) setErrorMsg(ERROR_MSG.USER_NOT_FOUND);
            else if(err.response?.status === 409) setErrorMsg(ERROR_MSG.ALREADY_BOUGHT);
            else if(err.response?.status === 404) setErrorMsg(ERROR_MSG.ITEM_NOT_FOUND);
            else if(err.response?.status === 403) setErrorMsg(ERROR_MSG.NOT_AUTHENTIFICATED);
            errorWhileBuying = true;
        } finally {
            if(!errorWhileBuying) {
                // TODO: Recharger les données de l'utilisateur
                fetchShopItems();
                //setCoins(coins - shop[uuid].cost);
                //setShop(...shop, );
            }
        }
    }

    const handleEquip = async (uuid) => {
        let errorWhileEquipping = false;
        try {
            const response = await axiosPrivate.post(
                "/user/buy", {username: auth.user,itemBought: uuid}
            );
        } catch(err) {
            if(!err?.response) setErrorMsg(ERROR_MSG.SERVER_DOWN);
            else if(err.response?.status === 412) setErrorMsg(ERROR_MSG.USER_NOT_FOUND);
            else if(err.response?.status === 409) setErrorMsg(ERROR_MSG.ALREADY_EQUIPPED);
            else if(err.response?.status === 404) setErrorMsg(ERROR_MSG.ITEM_NOT_FOUND);
            else if(err.response?.status === 403) setErrorMsg(ERROR_MSG.NOT_AUTHENTIFICATED);
            errorWhileEquipping = true;
        } finally {
            if(!errorWhileEquipping) fetchShopItems();
        }
    }

    const handleUnequip = async (uuid) => {
        let errorWhileUnequipping = false;
        try {
            const response = await axiosPrivate.post(
                "/user/buy", {username: auth.user,itemBought: uuid}
            );
        } catch(err) {
            if(!err?.response) setErrorMsg(ERROR_MSG.SERVER_DOWN);
            else if(err.response?.status === 412) setErrorMsg(ERROR_MSG.USER_NOT_FOUND);
            else if(err.response?.status === 409) setErrorMsg(ERROR_MSG.NOT_EQUIPPED);
            else if(err.response?.status === 404) setErrorMsg(ERROR_MSG.ITEM_NOT_FOUND);
            else if(err.response?.status === 403) setErrorMsg(ERROR_MSG.NOT_AUTHENTIFICATED);
            errorWhileUnequipping = true;
        } finally {
            if(!errorWhileUnequipping) fetchShopItems();
        }
    }

    useEffect(() => {
        fetchShopItems();
    }, []);

    return (
        isLoading ? <p>Chargement en cours...</p> :
        errorWhileLoading ? <p>Failed to fetch shop data from API.</p> :
        <div className='text-white'>
            <p>Coins: {coins}</p>
            <ul>
                {Object.entries(shop).map((catAndItemList) => (
                    <li>
                        <h3><u>{catAndItemList[0]}</u></h3>
                        {<ul style={{"paddingLeft": "30px"}}>
                            {catAndItemList[1].map((item) => (
                                <li>
                                    <b>{item.name}</b> : {item.cost} coins
                                    {
                                        !item.cannotBeBoughtTwice ? // - Achat multiple
                                            <>
                                                {item.quantityOwned ? <i>(Owned: {item.quantityOwned})</i> : <></>}
                                                <button onClick={() => handleBuy(item.uuid)}>Buy</button>
                                            </>
                                        : // - Achat unique
                                            <>
                                                {!item.quantityOwned ? <button onClick={() => handleBuy(item.uuid)}>Buy</button> : <></>}
                                            </>
                                    }
                                    {item.quantityOwned ? !item.equipped ? <button onClick={() => handleEquip(item.uuid)}>Equip</button> : <button onClick={() => handleUnequip(item.uuid)}>Unequip</button> : <></>}
                                </li>
                            ))}
                        </ul>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Shop;