const User = require('../../models/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { generateRandomAlphanumeric, encodeStringToBase64, extractBearerToken } = require('../../utils/helpers');
const logger = require('../../utils/logger');

function generateEncodedRandomStringperm(length) {
    const randomString = generateRandomAlphanumeric(length);
    return encodeStringToBase64(randomString);
}

const login = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ email: email }, { name: name }] });

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, success: false, ResponseMessage: 'User not found' });
        }

        // Compare password with bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            let permtoken;
            let existingUserWithTempTokenperm;

            do {
                permtoken = generateEncodedRandomStringperm(255);
                existingUserWithTempTokenperm = await User.findOne({ permtoken });
            } while (existingUserWithTempTokenperm);

            user.permtoken = permtoken;
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
            return res.status(401).json({ ResponseCode: 401, ResponseMessage: 'Invalid password', success: false });
        }
    } catch (error) {
        logger.error('Error in user login:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to log in', success: false, error: error.message });
    }
};

const otplogin = async (req, res) => {
    const { otp } = req.body;
    const token = extractBearerToken(req.headers['authorization']);

    if (!token) {
        return res.status(401).json({ ResponseCode: 401, success: false, ResponseMessage: 'Unauthorized - Bearer token not found' });
    }

    try {
        const user = await User.findOne({ temptoken: token });

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, success: false, ResponseMessage: 'User not found' });
        }

        if (user.otp === otp) {
            const currentTime = new Date();
            const lastUpdateTime = new Date(user.updatedAt);
            const timeDifferenceInMinutes = Math.floor((currentTime - lastUpdateTime) / (1000 * 60));

            if (timeDifferenceInMinutes > 1) {
                return res.status(400).json({ ResponseCode: 400, success: false, ResponseMessage: 'OTP expired' });
            }

            user.otp = null;
            await user.save();

            const responseData = {
                id: user._id,
                name: user.name,
                email: user.email,
            };

            return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'OTP verified. Login successful.', success: true, ResponseData: responseData });
        } else {
            return res.status(401).json({ ResponseCode: 401, ResponseMessage: 'Invalid OTP', success: false });
        }
    } catch (error) {
        logger.error('Error in OTP login:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to verify OTP', success: false, error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    // Auth guard: require a valid Bearer token
    const token = extractBearerToken(req.headers['authorization']);

    if (!token) {
        return res.status(401).json({ ResponseCode: 401, success: false, ResponseMessage: 'Unauthorized - Bearer token not found' });
    }

    try {
        const requestingUser = await User.findOne({ permtoken: token });

        if (!requestingUser) {
            return res.status(401).json({ ResponseCode: 401, success: false, ResponseMessage: 'Unauthorized - Invalid token' });
        }

        const users = await User.find({}).select('-password -temptoken -permtoken');

        if (users.length === 0) {
            return res.status(404).json({ ResponseCode: 404, ResponseMessage: 'No users found', success: false });
        }

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'Users retrieved successfully', success: true, ResponseData: users });
    } catch (error) {
        logger.error('Error in getting all users:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to retrieve users', success: false, error: error.message });
    }
};

const getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ ResponseCode: 400, ResponseMessage: 'Invalid user ID', success: false });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const user = await User.findById(objectId).select('-password -temptoken -permtoken');

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, ResponseMessage: 'User not found', success: false });
        }

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'User retrieved successfully', success: true, ResponseData: user });
    } catch (error) {
        logger.error('Error in getting user by ID:', error);
        return res.status(500).json({ ResponseCode: 500, ResponseMessage: 'Failed to retrieve user', success: false, error: error.message });
    }
};

const getUserByEmail = async (req, res) => {
    const { userEmail } = req.body;

    try {
        const user = await User.findOne({ email: userEmail }).select('-password -temptoken -permtoken');

        if (!user) {
            return res.status(404).json({ ResponseCode: 404, ResponseMessage: 'User not found', success: false });
        }

        return res.status(200).json({ ResponseCode: 200, ResponseMessage: 'User retrieved successfully', success: true, ResponseData: user });
    } catch (error) {
        logger.error('Error in getting user by email:', error);
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
