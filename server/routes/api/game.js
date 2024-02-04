const express = require('express');
const router = express.Router();

const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/rolesList');

// Accept the io parameter in the route file
module.exports = (io) => {
    const gameController = require('../../controllers/api/gameController')(io); // Pass io to get the controller

    router.route('/')
        .get(gameController.getAllGames)
        .post(verifyRoles(ROLES_LIST.User), gameController.createNewGame);

    router.route('/:code/players').get(gameController.getPlayers);
    router.route('/:code/players/:username').get(gameController.getUserData);
    router.route('/:code').get(gameController.getGame);

    return router;
};
