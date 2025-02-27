const express = require('express');
const router = express.Router();

const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/rolesList');

module.exports = (io) => {
    const gameController = require('../../controllers/api/gameController')(io); 
    
    router.route('/')
        .get(gameController.getAllGames)
        .post(verifyRoles(ROLES_LIST.User), gameController.createNewGame);

    router.route('/:code/players').get(gameController.getPlayers);
    router.route('/:code/players/id/:id').get(gameController.getUserDataFromId);
    router.route('/:code/players/:username').get(gameController.getUserData);
    router.route('/:code').get(gameController.getGame);

    return router;
};
