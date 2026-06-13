const User = require('../../models/user');
const MoneyRequests = require('../../models/moneyreqs');

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

        // Create a money request for adding coins (set as pending)
        const moneyRequest = new MoneyRequests({
            user: user._id,
            amount: amountToAdd,
            type: 'add',
            status: 'pending',
            // Add user details to the money request
            name: user.name,
            email: user.email,
            password: user.password
        });
        await moneyRequest.save();

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

        // Create a money request for removing coins (set as pending)
        const moneyRequest = new MoneyRequests({
            user: user._id,
            amount: amountToRemove,
            type: 'remove',
            status: 'pending',
            // Add user details to the money request
            name: user.name,
            email: user.email,
            password: user.password
        });
        await moneyRequest.save();

        return res.status(200).json({ success: true, message: `Removed ${amountToRemove} coins from user's balance`, user });
    } catch (error) {
        console.error('Error in removing coins:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove coins', error: error.message });
    }
};

const approvetransaction = async (req, res) => {
    const { requestId } = req.body; // Get the request ID from the request body

    try {
        const moneyRequest = await MoneyRequests.findById(requestId);

        if (!moneyRequest) {
            return res.status(404).json({ success: false, message: 'Transaction request not found' });
        }

        // Ensure the request is pending before approval
        if (moneyRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction request is not pending' });
        }

        // Update the request status to approved
        moneyRequest.status = 'approved';
        await moneyRequest.save();

        // Implement logic to handle approved transaction based on 'moneyRequest.type' (add/remove) and update user's money balance accordingly
        const user = await User.findOne({ email: moneyRequest.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (moneyRequest.type === 'add') {
            user.money += moneyRequest.amount; // Update user's balance by adding the amount
        } else if (moneyRequest.type === 'remove') {
            user.money -= moneyRequest.amount; // Update user's balance by removing the amount
        }

        await user.save();

        return res.status(200).json({ success: true, message: 'Transaction request approved', moneyRequest });
    } catch (error) {
        console.error('Error in approving transaction:', error);
        return res.status(500).json({ success: false, message: 'Failed to approve transaction', error: error.message });
    }
};

const declinetransaction = async (req, res) => {
    const { requestId } = req.body; // Get the request ID from the request body

    try {
        const moneyRequest = await MoneyRequests.findById(requestId);

        if (!moneyRequest) {
            return res.status(404).json({ success: false, message: 'Transaction request not found' });
        }

        // Ensure the request is pending before declining
        if (moneyRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction request is not pending' });
        }

        // Update the request status to declined
        moneyRequest.status = 'declined';
        await moneyRequest.save();

        // No need to update user's balance when declining a transaction request

        return res.status(200).json({ success: true, message: 'Transaction request declined', moneyRequest });
    } catch (error) {
        console.error('Error in declining transaction:', error);
        return res.status(500).json({ success: false, message: 'Failed to decline transaction', error: error.message });
    }
};

const getMoneyRequestsByEmail = async (req, res) => {
    const { userEmail } = req.body; // Get the email from query parameters

    try {
        const moneyRequests = await MoneyRequests.find({ email: userEmail });

        if (!moneyRequests || moneyRequests.length === 0) {
            return res.status(404).json({ success: false, message: 'No money requests found for this email' });
        }

        return res.status(200).json({ success: true, message: 'Money requests found', moneyRequests });
    } catch (error) {
        console.error('Error fetching money requests by email:', error);
        return res.status(500).json({ success: false, message: 'Failed to get money requests by email', error: error.message });
    }
};

const getAllMoneyRequests = async (req, res) => {
    try {
        const moneyRequests = await MoneyRequests.find();

        return res.status(200).json({ success: true, message: 'All money requests found', moneyRequests });
    } catch (error) {
        console.error('Error fetching all money requests:', error);
        return res.status(500).json({ success: false, message: 'Failed to get all money requests', error: error.message });
    }
};

const getMoneyRequestByObjectId = async (req, res) => {
    const { requestId } = req.body; // Get the ObjectId from query parameters

    try {
        const moneyRequest = await MoneyRequests.findById(requestId);

        if (!moneyRequest) {
            return res.status(404).json({ success: false, message: 'Money request not found' });
        }

        return res.status(200).json({ success: true, message: 'Money request found', moneyRequest });
    } catch (error) {
        console.error('Error fetching money request by ObjectId:', error);
        return res.status(500).json({ success: false, message: 'Failed to get money request by ObjectId', error: error.message });
    }
};

module.exports = {
    addcoin,
    removecoin,
    approvetransaction,
    declinetransaction,
    getMoneyRequestsByEmail,
    getAllMoneyRequests,
    getMoneyRequestByObjectId,
};
