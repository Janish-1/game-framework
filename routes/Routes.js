// routes/helloRoutes.js
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/LoginRegister/register');
const { login, otplogin, getAllUsers, getUserById, getUserByEmail } = require('../controllers/LoginRegister/login');
const { newotp, verifyotp } = require('../controllers/LoginRegister/otp');
const { addcoin, removecoin, approvetransaction, declinetransaction, getMoneyRequestsByEmail, getAllMoneyRequests, getMoneyRequestByObjectId } = require('../controllers/MoneySystem/money');
const imageRoutes = require('../controllers/ImageSystem/image');
const { updateUsername,updatepassword,logout } = require('../controllers/PlayerProfile/playerupdate');
const { generateresettoken,sendtokentoemail,changepassword } = require('../controllers/PlayerProfile/resetpassword');
const { newtemptoken } = require('../controllers/tokengenerators/token');

// Login and Register Endpoints
router.post('/register',register);
router.post('/login',login);
router.post('/newotp',newotp);
router.post('/verifyotp',verifyotp);
router.post('/otplogin',otplogin);

// Money Endpoints
router.post('/addcoin',addcoin);
router.post('/removecoin',removecoin);
router.post('/approvetransaction',approvetransaction);
router.post('/declinetransaction',declinetransaction);
router.post('/moneyreqsemail',getMoneyRequestsByEmail);
router.get('/moneyreqsall',getAllMoneyRequests);
router.post('/moneyreqsobject',getMoneyRequestByObjectId);

// Player Data Endpoints
router.get('/allusers', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users/email', getUserByEmail);

// Image Endpoints
router.post('/imageupload', imageRoutes);

// Profile Update
router.post('/updateusername',updateUsername);
router.post('/updatepassword',updatepassword);
router.get('/generateresettoken',generateresettoken);
router.get('/sendtokentoemail',sendtokentoemail);
router.post('/resetpassword',changepassword);
router.post('/logout',logout);

//Token Regenerators
router.post('/newtemptoken',newtemptoken);

module.exports = router;
