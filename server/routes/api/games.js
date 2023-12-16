const express = require('express');
const router = express.Router();

const gamesController = require('../../controllers/api/gamesController');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/rolesList');

router
    .route('/')
    .get(verifyRoles(ROLES_LIST.User), gamesController.getAllGames)
    .post(verifyRoles(ROLES_LIST.User), gamesController.createNewGame);

router.route('/:id').get(gamesController.getGame);

module.exports = router;
