const express = require('express');
const router = express.Router();

const verifyRoles = require('../middleware/verifyRoles');
const ROLES_LIST = require('../config/rolesList');
const userActionController = require('../controllers/userActionController');

router.get('/items', userActionController.getAllBuyableItems);
router.post('/edit', verifyRoles(ROLES_LIST.User), userActionController.handleEditProfile);
router.post('/buy', verifyRoles(ROLES_LIST.User), userActionController.handleBuy);
router.post('/equip', verifyRoles(ROLES_LIST.User), userActionController.handleEquip);
router.post('/unequip', verifyRoles(ROLES_LIST.User), userActionController.handleUnequip);


module.exports = router;
