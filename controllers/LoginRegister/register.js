const User = require('../../models/user');
const crypto = require('crypto');

// Function to generate a random six-digit number
const generateSixDigitNumber = () => {
    const min = 100000; // Minimum value (inclusive)
    const max = 999999; // Maximum value (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateRandomAlphanumeric(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}

function encodeStringToBase64(str) {
    return Buffer.from(str).toString('base64');
}

function generateEncodedRandomString(length) {
    // Generate a random alphanumeric string
    const randomString = generateRandomAlphanumeric(length);

    // Encode the generated string to base64
    const encodedString = encodeStringToBase64(randomString);

    return encodedString;
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
        } while (existingUserWithOtp); // Keep generating until a unique OTP is found

        let temptoken;
        let existingUserWithTempToken;

        // Generating and verifying unique temporary token
        do {
            temptoken = generateEncodedRandomString(255);
            existingUserWithTempToken = await User.findOne({ temptoken }); // Check if the token already exists in the database
        } while (existingUserWithTempToken); // Keep generating until a unique token is found

        // Encrypt the password using crypto
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        const newUser = new User({ name, email, password: hashedPassword, temptoken, permtoken: null, otp ,updatedAt: Date.now()});

        await newUser.save();

        const responseData = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            temptoken: temptoken, // Replace this with your token generation logic
            otp: otp, // Replace this with your OTP generation logic
        };

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'signup successfully.', success: true, ResponseData: responseData });
    } catch (error) {
        console.error('Error in user registration:', error); // Log the error for debugging
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to register user', success: false, error: error.message });
    }
};

module.exports = {
    register,
};
