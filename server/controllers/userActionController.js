const User = require("../models/User");
const { ERROR_MSG, SUCCESS_MSG } = require("../config/configMessages");
const BUYABLE_ITEMS = require("../config/buyableItems");


const getAllBuyableItems = (req, res) => {
    res.status(201).json(BUYABLE_ITEMS);
}

const handleEditProfile = async (req, res) => {
    try {
        const { username, newUsername, newProfilePicture } = req.body;
        if(!username || (!newUsername && !newProfilePicture)) {
            return res
                .status(400)
                .json({ message: "Please specify your username, a new username and/or a new profile picture" })
        }
        const filter = { username: username };
        let update = {};
        if(newUsername) update.username = newUsername;
        if(newProfilePicture) update.profilePicture = newProfilePicture;
        const editResult = await User.findOneAndUpdate(filter, update);
        if(!editResult) {
            return res
                .status(404)
                .json({ message: ERROR_MSG.USER_NOT_FOUND });
        }
        return res.status(201).json({ message: SUCCESS_MSG.PROFILE_EDITED });
    } catch(err) {
        return res.status(500).json(err.message);
    }
}


const handleBuy = async (req, res) => {
    try {
        const { username, itemBought } = req.body;
        if(!username || !itemBought) {
            return res
                .status(400)
                .json({ message: "Please specify your username and the item that you bought" })
        }
        if(!BUYABLE_ITEMS[itemBought]) res.status(404).json({ message: ERROR_MSG.ITEM_NOT_FOUND });
        const filter = { username: username };
        const user = await User.findOne(filter);
        if(!user) return res.status(412).json({ message: ERROR_MSG.USER_NOT_FOUND });
        const itemAlreadyBought = Object.keys(user.items.toJSON()).includes(itemBought);
        if(BUYABLE_ITEMS[itemBought].cannotBeBoughtTwice && itemAlreadyBought) return res.status(409).json({ message: ERROR_MSG.ITEM_ALREADY_BOUGHT });
        const coinsNeeded = BUYABLE_ITEMS[itemBought].cost;
        if(user.coins < coinsNeeded) return res.status(402).json({ message: ERROR_MSG.NOT_ENOUGH_COINS });
        if(itemAlreadyBought) {
            await User.findOneAndUpdate(filter, {
                $inc: { [`items.${itemBought}.amount`]: 1, coins: (-1)*coinsNeeded }
            });
        } else {
            const newItemObject = {amount: 1, equipped: false};
            await User.findOneAndUpdate(filter, {
                $set: { [`items.${itemBought}`]: newItemObject },
                $inc: {coins: (-1)*coinsNeeded}
            });
        }
        return res.status(201).json({ message: SUCCESS_MSG.ITEM_BOUGHT });
    } catch(err) {
        return res.status(500).json(err.message);
    }
}


const handleEquip = async (req, res) => {
    try {
        const { username, itemUUID } = req.body;
        if(!username || !itemUUID) {
            return res
                .status(400)
                .json({ message: ERROR_MSG.INVALID_REQUEST_NOHELP });
        }
        if(!BUYABLE_ITEMS[itemUUID]) res.status(404).json({ message: ERROR_MSG.ITEM_NOT_FOUND });
        const filter = { username: username };
        const user = await User.findOne(filter);
        if(!user) return res.status(404).json({ message: ERROR_MSG.USER_NOT_FOUND });
        const userItems = user.items.toJSON();
        if(userItems[itemUUID].equipped) return res.status(409).json({ message: ERROR_MSG.ITEM_ALREADY_EQUIPPED });
        const equipCategory = BUYABLE_ITEMS[itemUUID].category;
        for(let uuid of Object.keys(userItems)) if(BUYABLE_ITEMS[uuid].category == equipCategory) userItems[uuid].equipped = false;
        userItems[itemUUID].equipped = true;
        await User.findOneAndUpdate(filter, {$set: {items: userItems}});
        return res.status(201).json({ message: SUCCESS_MSG.ITEM_EQUIPPED })
    } catch(err) {
        return res.status(500).json(err.message);
    }
}

const handleUnequip = async (req, res) => {
    try {
        const { username, itemUUID } = req.body;
        if(!username || !itemUUID) {
            return res
                .status(400)
                .json({ message: ERROR_MSG.INVALID_REQUEST_NOHELP });
        }
        if(!BUYABLE_ITEMS[itemUUID]) res.status(404).json({ message: ERROR_MSG.ITEM_NOT_FOUND });
        const filter = { username: username };
        const user = await User.findOne(filter);
        if(!user) return res.status(404).json({ message: ERROR_MSG.USER_NOT_FOUND });
        const userItems = user.items.toJSON();
        if(!userItems[itemUUID].equipped) return res.status(409).json({ message: ERROR_MSG.ITEM_NOT_EQUIPPED });
        await User.findOneAndUpdate(filter, {$set: {[`items.${itemUUID}.equipped`]: false}});
        return res.status(201).json({ message: SUCCESS_MSG.ITEM_UNEQUIPPED })
    } catch(err) {
        return res.status(500).json(err.message);
    }
}








module.exports = { getAllBuyableItems, handleEditProfile, handleBuy, handleEquip, handleUnequip };