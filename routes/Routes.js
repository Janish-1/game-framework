// routes/helloRoutes.js
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/register');
const { login, otplogin, getAllUsers, getUserById, getUserByEmail } = require('../controllers/login');
const { newotp, verifyotp } = require('../controllers/otp');
const { addcoin, removecoin, approvetransaction, declinetransaction, getMoneyRequestsByEmail, getAllMoneyRequests, getMoneyRequestByObjectId } = require('../controllers/money');

// Require the image upload route module
const imageRoutes = require('../controllers/image');

router.post('/register',register);
router.post('/login',login);
router.post('/newotp',newotp);
router.post('/verifyotp',verifyotp);
router.post('/otplogin',otplogin); 
router.post('/addcoin',addcoin);
router.post('/removecoin',removecoin);
router.post('/approvetransaction',approvetransaction);
router.post('/declinetransaction',declinetransaction);
router.post('/moneyreqsemail',getMoneyRequestsByEmail);
router.get('/moneyreqsall',getAllMoneyRequests);
router.post('/moneyreqsobject',getMoneyRequestByObjectId);
router.get('/allusers', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users/email', getUserByEmail);
// Use the image upload route
router.post('/imageupload', imageRoutes);

module.exports = router;
