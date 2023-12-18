const express = require('express');
const router = express.Router();

const gameController = require('../../controllers/api/gameController');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/rolesList');

router.route('/')
    .get(gameController.getAllGames)
    .post(verifyRoles(ROLES_LIST.User), gameController.createNewGame);

router.route('/:code/:username').get(gameController.getUserData);
router.route('/:code').get(gameController.getGame);

module.exports = router;
