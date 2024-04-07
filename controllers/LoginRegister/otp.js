const User = require('../../models/user');

// Function to generate a random six-digit number
const generateSixDigitNumber = () => {
    const min = 100000; // Minimum value (inclusive)
    const max = 999999; // Maximum value (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const newotp = async (req, res) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ ResponseCode: 401,success: false, ResponseMessage: 'Unauthorized - Bearer token not found' });
    }

    const token = authHeader.split(' ')[1]; // Extracting the token part from the header

    try {
        // Generating a unique OTP
        let otp;
        let existingUserWithOtp;

        do {
            otp = generateSixDigitNumber();
            existingUserWithOtp = await User.findOne({ otp });
        } while (existingUserWithOtp); // Keep generating until a unique OTP is found

        // Find the user by their temptoken and update the OTP
        const updatedUser = await User.findOneAndUpdate(
            { temptoken: token },
            { otp: otp, updatedAt: Date.now()},
            { new: true } // To get the updated user data in the response
        );

        if (!updatedUser) {
            return res.status(404).json({ ResponseCode: 404,success: false, ResponseMessage: 'User not found' });
        }

        res.status(200).json({
            ResponseCode: 200,
            success: true,
            ResponseMessage: 'New OTP generated and updated successfully',
            newOTP: otp,
            responseData: updatedUser
        });
    } catch (error) {
        console.error('Error generating and updating OTP:', error);
        return res.status(500).json({ ResponseCode: 500,success: false, ResponseMessage: 'Failed to generate and update OTP', error: error.message });
    }
};


const verifyotp = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ ResponseCode: 401,success: false, ResponseMessage: 'Unauthorized - Bearer token not found' });
    }

    const token = authHeader.split(' ')[1]; // Extracting the token part from the header
    const { otp } = req.body; // Assuming the OTP is sent in the request body

    try {
        const user = await User.findOne({ temptoken: token });

        if (!user) {
            return res.status(404).json({ ResponseCode: 404,success: false, ResponseMessage: 'User not found or invalid token' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ ResponseCode: 400,success: false, ResponseMessage: 'Invalid OTP' });
        }

        const currentTime = new Date();
        const lastUpdateTime = new Date(user.updatedAt);
        const timeDifferenceInMinutes = Math.floor((currentTime - lastUpdateTime) / (1000 * 60));
        
        if (timeDifferenceInMinutes > 1) {
            return res.status(400).json({ ResponseCode: 400, success: false, ResponseMessage: 'OTP expired' });
        }
        
        // Encapsulating user-related data within a 'userData' object in the response
        const userData = {
            name: user.name,
            email: user.email,
            temptoken: user.temptoken
            // Add other necessary user data here
        };

        return res.status(200).json({ 
            ResponseCode: 200, 
            success: true, 
            ResponseMessage: 'OTP verified successfully',
            responseData: userData // Encapsulated user data
        });
    } catch (error) {
        console.error('Error in OTP verification:', error);
        return res.status(500).json({ ResponseCode: 500,success: false, ResponseMessage: 'Failed to verify OTP', error: error.message });
    }
};

module.exports= {
    newotp,
    verifyotp,
};