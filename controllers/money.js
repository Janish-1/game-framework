const User = require('../models/user');
const MoneyRequests = require('../models/moneyreqs');

const addcoin = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Bearer token not found' });
    }

    const permtoken = authHeader.split(' ')[1]; // Extract 'permtoken' from the Authorization header
    const amountToAdd = parseInt(req.body.amount); // Get the amount to add from request body

    try {
        const user = await User.findOne({ permtoken });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add coins to the user's balance
        user.coins += amountToAdd;
        await user.save();

        return res.status(200).json({ success: true, message: `Added ${amountToAdd} coins to user's balance`, user });
    } catch (error) {
        console.error('Error in adding coins:', error);
        return res.status(500).json({ success: false, message: 'Failed to add coins', error: error.message });
    }
};

const removecoin = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Bearer token not found' });
    }

    const permtoken = authHeader.split(' ')[1]; // Extract 'permtoken' from the Authorization header
    const amountToRemove = parseInt(req.body.amount); // Get the amount to remove from request body

    try {
        const user = await User.findOne({ permtoken });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Ensure user has sufficient coins to remove
        if (user.coins < amountToRemove) {
            return res.status(400).json({ success: false, message: 'Insufficient coins' });
        }

        // Remove coins from the user's balance
        user.coins -= amountToRemove;
        await user.save();

        return res.status(200).json({ success: true, message: `Removed ${amountToRemove} coins from user's balance`, user });
    } catch (error) {
        console.error('Error in removing coins:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove coins', error: error.message });
    }
};

module.exports = {
    addcoin,
    removecoin,
};
