const User = require('../models/user');
const crypto = require('crypto');

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

function generateEncodedRandomStringperm(length) {
    // Generate a random alphanumeric string
    const randomString = generateRandomAlphanumeric(length);

    // Encode the generated string to base64
    const encodedString = encodeStringToBase64(randomString);

    return encodedString;
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, ResponseMessage: 'User not found. Please sign up.', success: false });
        }

        const hashedpassword = crypto.createHash('sha256').update(password).digest('hex');

        // Check if the entered password matches the stored hashed password
        if (hashedpassword === user.password) {
            // Passwords match, proceed with login logic
            // Generate unique permtoken and update the user's permtoken here if needed
            let permtoken;
            let existingUserWithTempTokenperm;

            // Generating and verifying unique temporary token
            do {
                permtoken = generateEncodedRandomStringperm(255);
                existingUserWithTempTokenperm = await User.findOne({ permtoken });
            } while (existingUserWithTempTokenperm); // Keep generating until a unique token is found

            user.permtoken = permtoken; // Set the generated permtoken for the user
            await user.save();

            const responseData = {
                id: user._id,
                name: user.name,
                email: user.email,
                permtoken: permtoken,
            };

            res.status(200).json({ ResponseCode: 200, ResponseMessage: 'Login successful.', success: true, ResponseData: responseData });
        } else {
            // Passwords don't match
            return res.status(401).json({ ResponseCode: 401, ResponseMessage: 'Invalid password', success: false });
        }
    } catch (error) {
        console.error('Error in user login:', error); // Log the error for debugging
        res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to log in', success: false, error: error.message });
    }
};

module.exports = {
    login,
};
