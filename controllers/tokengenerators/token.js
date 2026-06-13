// Imported data
const User = require('../../models/user');
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

function generateEncodedRandomString(length) {
    // Generate a random alphanumeric string
    const randomString = generateRandomAlphanumeric(length);

    // Encode the generated string to base64
    const encodedString = encodeStringToBase64(randomString);

    return encodedString;
}

// Modules
const newtemptoken = async (req,res) => {
    const headers = req.headers["secret_key"];
    const { playerid } = req.body;

    const realkey = process.env.SECRET_KEY;

    if (!headers || headers !== realkey){
        return res.status(400).json({
            'success':false,
            'responsemessage':"Invalid Key",
            'responsecode':400,
        });
    }

    const token = generateEncodedRandomString(255);

    const player = await User.findOne({ _id:playerid });

    if (!player){
        return res.status(400).json({
            'success':false,
            'responsemessage':"User Not Found",
            'responsecode': 400,
        });
    }

    player.temptoken = token;
    await player.save();
    
    return res.status(400).json({
        'success':true,
        'responsemessage':"Temp Token Regenerated",
        'responsecode': 400,
    }); 
}

const newpermtoken = async (req,res) => {
    const headers = req.headers['secret_key'];
    const { playerid } = req.body;

    const realkey = process.env.SECRET_KEY;

    if (!headers || headers !== realkey){
        return res.status(400).json({
            success:"false",
            responsemessage:"token not verified",
            responsecode: 400,
        });
    }

    const player = await User.findOne({ _id:playerid});

    if (!player){
        return res.status(400).json({
            success:"false",
            responsemessage:"token not verified",
            responsecode: 400,
        });
    }
}

module.exports={
    newtemptoken,
    newpermtoken,
}