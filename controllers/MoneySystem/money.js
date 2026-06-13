const User = require('../../models/user');
const MoneyRequests = require('../../models/moneyreqs');
const logger = require('../../utils/logger');

const addcoin = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Bearer token not found' });
    }

    const permtoken = authHeader.split(' ')[1];
    const amountToAdd = parseInt(req.body.amount);

    try {
        const user = await User.findOne({ permtoken });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create a money request — store only userId reference, not credentials
        const moneyRequest = new MoneyRequests({
            user: user._id,
            amount: amountToAdd,
            type: 'add',
            status: 'pending',
            name: user.name,
            email: user.email,
        });
        await moneyRequest.save();

        const userResponse = { id: user._id, name: user.name, email: user.email, money: user.money };
        return res.status(200).json({ success: true, message: `Added ${amountToAdd} coins to user's balance`, user: userResponse });
    } catch (error) {
        logger.error('Error in adding coins:', error);
        return res.status(500).json({ success: false, message: 'Failed to add coins', error: error.message });
    }
};

const removecoin = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Bearer token not found' });
    }

    const permtoken = authHeader.split(' ')[1];
    const amountToRemove = parseInt(req.body.amount);

    try {
        const user = await User.findOne({ permtoken });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create a money request — store only userId reference, not credentials
        const moneyRequest = new MoneyRequests({
            user: user._id,
            amount: amountToRemove,
            type: 'remove',
            status: 'pending',
            name: user.name,
            email: user.email,
        });
        await moneyRequest.save();

        const userResponse = { id: user._id, name: user.name, email: user.email, money: user.money };
        return res.status(200).json({ success: true, message: `Removed ${amountToRemove} coins from user's balance`, user: userResponse });
    } catch (error) {
        logger.error('Error in removing coins:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove coins', error: error.message });
    }
};

const approvetransaction = async (req, res) => {
    const { requestId } = req.body;

    try {
        const moneyRequest = await MoneyRequests.findById(requestId);

        if (!moneyRequest) {
            return res.status(404).json({ success: false, message: 'Transaction request not found' });
        }

        if (moneyRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction request is not pending' });
        }

        moneyRequest.status = 'approved';
        await moneyRequest.save();

        // Look up user by the stored userId reference
        const user = await User.findById(moneyRequest.user);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (moneyRequest.type === 'add') {
            user.money += moneyRequest.amount;
        } else if (moneyRequest.type === 'remove') {
            user.money -= moneyRequest.amount;
        }

        await user.save();

        return res.status(200).json({ success: true, message: 'Transaction request approved', moneyRequest });
    } catch (error) {
        logger.error('Error in approving transaction:', error);
        return res.status(500).json({ success: false, message: 'Failed to approve transaction', error: error.message });
    }
};

const declinetransaction = async (req, res) => {
    const { requestId } = req.body;

    try {
        const moneyRequest = await MoneyRequests.findById(requestId);

        if (!moneyRequest) {
            return res.status(404).json({ success: false, message: 'Transaction request not found' });
        }

        if (moneyRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction request is not pending' });
        }

        moneyRequest.status = 'declined';
        await moneyRequest.save();

        return res.status(200).json({ success: true, message: 'Transaction request declined', moneyRequest });
    } catch (error) {
        logger.error('Error in declining transaction:', error);
        return res.status(500).json({ success: false, message: 'Failed to decline transaction', error: error.message });
    }
};

const getMoneyRequestsByEmail = async (req, res) => {
    const { userEmail } = req.body;

    try {
        const moneyRequests = await MoneyRequests.find({ email: userEmail });

        if (!moneyRequests || moneyRequests.length === 0) {
            return res.status(404).json({ success: false, message: 'No money requests found for this email' });
        }

        return res.status(200).json({ success: true, message: 'Money requests found', moneyRequests });
    } catch (error) {
        logger.error('Error fetching money requests by email:', error);
        return res.status(500).json({ success: false, message: 'Failed to get money requests by email', error: error.message });
    }
};

const getAllMoneyRequests = async (req, res) => {
    try {
        const moneyRequests = await MoneyRequests.find();
        return res.status(200).json({ success: true, message: 'All money requests found', moneyRequests });
    } catch (error) {
        logger.error('Error fetching all money requests:', error);
        return res.status(500).json({ success: false, message: 'Failed to get all money requests', error: error.message });
    }
};

const getMoneyRequestByObjectId = async (req, res) => {
    const { requestId } = req.body;

    try {
        const moneyRequest = await MoneyRequests.findById(requestId);

        if (!moneyRequest) {
            return res.status(404).json({ success: false, message: 'Money request not found' });
        }

        return res.status(200).json({ success: true, message: 'Money request found', moneyRequest });
    } catch (error) {
        logger.error('Error fetching money request by ObjectId:', error);
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
