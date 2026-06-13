const User = require('../../models/user');
const bcrypt = require('bcrypt');
const { generateRandomAlphanumeric, encodeStringToBase64 } = require('../../utils/helpers');
const logger = require('../../utils/logger');

// Function to generate a random six-digit number
const generateSixDigitNumber = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateEncodedRandomString(length) {
    const randomString = generateRandomAlphanumeric(length);
    return encodeStringToBase64(randomString);
}

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ ResponseCode: 400, ResponseMessage: 'Email already exists. Please use a different email.', success: false });
        }

        let otp;
        let existingUserWithOtp;

        // Generating unique OTP
        do {
            otp = generateSixDigitNumber();
            existingUserWithOtp = await User.findOne({ otp });
        } while (existingUserWithOtp);

        let temptoken;
        let existingUserWithTempToken;

        // Generating and verifying unique temporary token
        do {
            temptoken = generateEncodedRandomString(255);
            existingUserWithTempToken = await User.findOne({ temptoken });
        } while (existingUserWithTempToken);

        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({ name, email, password: hashedPassword, temptoken, permtoken: null, otp, updatedAt: Date.now() });

        await newUser.save();

        // Do NOT include OTP or temptoken in the response — OTP should only be sent via email
        const responseData = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        };

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'signup successfully.', success: true, ResponseData: responseData });
    } catch (error) {
        logger.error('Error in user registration:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to register user', success: false, error: error.message });
    }
};

module.exports = {
    register,
};
