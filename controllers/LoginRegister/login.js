const User = require('../../models/user');
const crypto = require('crypto');
const mongoose = require('mongoose');

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
    const { name, email, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ email: email }, { name: name }] });

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, success: false, ResponseMessage: 'User not found' });
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
            user.updatedAt = Date.now();
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
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to log in', success: false, error: error.message });
    }
};

const otplogin = async (req, res) => {
    const { otp } = req.body; // Extract the 'otp' from the request body
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ ResponseCode: 401, success: false, ResponseMessage: 'Unauthorized - Bearer token not found' });
    }

    const token = authHeader.split(' ')[1]; // Extracting the token part from the header

    try {
        const user = await User.findOne({ temptoken: token });

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, success: false, ResponseMessage: 'User not found' });
        }

        // Check if the provided OTP matches the stored OTP in the database
        if (user.otp === otp) { // Compare the provided OTP with the user's stored OTP

            const currentTime = new Date();
            const lastUpdateTime = new Date(user.updatedAt);
            const timeDifferenceInMinutes = Math.floor((currentTime - lastUpdateTime) / (1000 * 60));

            if (timeDifferenceInMinutes > 1) {
                return res.status(400).json({ ResponseCode: 400, success: false, ResponseMessage: 'OTP expired' });
            }

            // Clear the OTP here if you want to allow the user to log in only once with this OTP
            user.otp = null;
            await user.save();

            const responseData = {
                id: user._id,
                name: user.name,
                email: user.email,
            };

            return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'OTP verified. Login successful.', success: true, ResponseData: responseData });
        } else {
            // Invalid OTP
            return res.status(401).json({ ResponseCode: 401, ResponseMessage: 'Invalid OTP', success: false });
        }
    } catch (error) {
        console.error('Error in OTP login:', error); // Log the error for debugging
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to verify OTP', success: false, error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}); // Excluding sensitive data

        if (users.length === 0) {
            return res.status(404).json({ ResponseCode: 404, ResponseMessage: 'No users found', success: false });
        }

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'Users retrieved successfully', success: true, ResponseData: users });
    } catch (error) {
        console.error('Error in getting all users:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to retrieve users', success: false, error: error.message });
    }
};

const getUserById = async (req, res) => {
    const userId = req.params.id; // Extract the user ID from the request parameters

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ ResponseCode: 400, ResponseMessage: 'Invalid user ID', success: false });
        }

        const objectId = new mongoose.Types.ObjectId(userId); // Convert string ID to ObjectId

        const user = await User.findById(objectId);

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, ResponseMessage: 'User not found', success: false });
        }

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'User retrieved successfully', success: true, ResponseData: user });
    } catch (error) {
        console.error('Error in getting user by ID:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to retrieve user', success: false, error: error.message });
    }
};

const getUserByEmail = async (req, res) => {
    const { userEmail } = req.body; // Extract the user email from the request parameters

    try {
        const user = await User.findOne({ email: userEmail }); // Excluding sensitive data

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, ResponseMessage: 'User not found', success: false });
        }

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'User retrieved successfully', success: true, ResponseData: user });
    } catch (error) {
        console.error('Error in getting user by email:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to retrieve user', success: false, error: error.message });
    }
};

module.exports = {
    login,
    otplogin,
    getAllUsers,
    getUserById,
    getUserByEmail,
};
