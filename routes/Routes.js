// routes/helloRoutes.js
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/register');
const { login, otplogin } = require('../controllers/login');
const { newotp, verifyotp } = require('../controllers/otp');

router.post('/register',register);
router.post('/login',login);
router.post('/newotp',newotp);
router.post('/verifyotp',verifyotp);
router.post('/otplogin',otplogin); 

module.exports = router;
