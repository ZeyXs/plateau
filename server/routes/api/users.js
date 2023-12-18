const express = require('express');
const router = express.Router();

const usersController = require('../../controllers/api/usersController');
const verifyRoles = require('../../middleware/verifyRoles');
const rolesList = require('../../config/rolesList');

router
    .route('/')
    .get(verifyRoles(rolesList.Admin), usersController.getAllUsers)
    .post(verifyRoles(rolesList.Admin), usersController.createNewUser);

router.route('/:id').get(verifyRoles(rolesList.Admin), usersController.getUser);

module.exports = router;
