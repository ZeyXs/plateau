const express = require('express');
const router = express.Router();

const userController = require('../../controllers/api/userController');

router.route('/').get(userController.getAllUsers);
router.route('/:username').get(userController.getUser);
router.route('/id/:id').get(userController.getUserFromId);

module.exports = router;
