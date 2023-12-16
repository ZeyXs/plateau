const express = require('express');
const router = express.Router();

const gamesController = require('../../controllers/api/gamesController');
const verifyRoles = require('../../middleware/verifyRoles');
const rolesList = require('../../config/rolesList');

router
    .route('/')
    .get(gamesController.getAllGames)
    .post(verifyRoles(Object(rolesList.Admin), gamesController.createNewGame));

router.route('/:id').get(gamesController.getGame);

module.exports = router;
