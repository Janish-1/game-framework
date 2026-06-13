// Imported data
const User = require('../../models/user');
const { generateRandomAlphanumeric, encodeStringToBase64 } = require('../../utils/helpers');
const logger = require('../../utils/logger');

function generateEncodedRandomString(length) {
    const randomString = generateRandomAlphanumeric(length);
    return encodeStringToBase64(randomString);
}

// Modules
const newtemptoken = async (req, res) => {
    const headers = req.headers["secret_key"];
    const { playerid } = req.body;

    const realkey = process.env.SECRET_KEY;

    if (!headers || headers !== realkey) {
        return res.status(400).json({
            'success': false,
            'responsemessage': "Invalid Key",
            'responsecode': 400,
        });
    }

    const token = generateEncodedRandomString(255);

    const player = await User.findOne({ _id: playerid });

    if (!player) {
        return res.status(400).json({
            'success': false,
            'responsemessage': "User Not Found",
            'responsecode': 400,
        });
    }

    player.temptoken = token;
    await player.save();

    // Fix: was incorrectly returning status 400 on success; corrected to 200
    return res.status(200).json({
        'success': true,
        'responsemessage': "Temp Token Regenerated",
        'responsecode': 200,
    });
};

const newpermtoken = async (req, res) => {
    const headers = req.headers['secret_key'];
    const { playerid } = req.body;

    const realkey = process.env.SECRET_KEY;

    if (!headers || headers !== realkey) {
        return res.status(400).json({
            success: false,
            responsemessage: "token not verified",
            responsecode: 400,
        });
    }

    const player = await User.findOne({ _id: playerid });

    if (!player) {
        return res.status(400).json({
            success: false,
            responsemessage: "User Not Found",
            responsecode: 400,
        });
    }

    // Fix: was missing a return statement entirely
    return res.status(200).json({
        success: true,
        responsemessage: "Perm Token Regenerated",
        responsecode: 200,
    });
};

module.exports = {
    newtemptoken,
    newpermtoken,
};
