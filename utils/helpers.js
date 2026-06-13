const crypto = require('crypto');

const generateRandomAlphanumeric = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    return result;
};

const encodeStringToBase64 = (str) => Buffer.from(str).toString('base64');

const extractBearerToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
};

module.exports = { generateRandomAlphanumeric, encodeStringToBase64, extractBearerToken };
