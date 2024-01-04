// routes/helloRoutes.js
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/register');
const { login } = require('../controllers/login');
const { newotp, verifyotp } = require('../controllers/otp');

router.post('/register',register);
router.post('/login',login);
router.post('/newotp',newotp);
router.post('/verifyotp',verifyotp); 

module.exports = router;
