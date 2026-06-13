const User = require("../../models/user");
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const { extractBearerToken } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const generateresettoken = async (req, res) => {
  const permtoken = extractBearerToken(req.headers["authorization"]);

  if (!permtoken) {
    return res.status(401).json({
      success: false,
      responsecode: 401,
      responsemessage: "Invalid Token",
    });
  }

  const x = crypto.randomBytes(50).toString("hex");

  const user = await User.findOne({ permtoken });

  if (!user) {
    return res.status(401).json({
      success: false,
      responsecode: 401,
      responsemessage: "User Not Found",
    });
  }

  user.resetToken = x;
  await user.save();

  return res.status(200).json({
    success: true,
    responsecode: 200,
    responsemessage: "Reset token generated",
  });
};

const sendtokentoemail = async (req, res) => {
  // Fix: was `&&` (auth bypass bug) — corrected to use extractBearerToken
  const permtoken = extractBearerToken(req.headers["authorization"]);

  if (!permtoken) {
    return res.status(401).json({
      success: false,
      responsecode: 401,
      responsemessage: "Invalid Token",
    });
  }

  try {
    const verifydata = await User.findOne({ permtoken });

    if (!verifydata) {
      return res.status(401).json({
        success: false,
        responsecode: 401,
        responsemessage: "User Not Found",
      });
    }

    const verification = verifydata['resetToken'];

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL_USER,
      to: verifydata.email,
      subject: "Password Reset Code",
      text: "Your password reset code: " + verification,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        logger.error('Email send error:', error);
        return res.status(500).json({
          "success": false,
          "responsecode": 500,
          "responsemessage": "Email Send Failed"
        });
      } else {
        logger.info('Email Sent: ' + info.response);
        return res.status(200).json({
          "success": true,
          "responsecode": 200,
          "responsemessage": "Email Sent Successfully"
        });
      }
    });
  } catch (error) {
    logger.error('Error in sendtokentoemail:', error);
    return res.status(500).json({
      success: false,
      responsecode: 500,
      responsemessage: "Internal Server Error",
    });
  }
};

const changepassword = async (req, res) => {
  const { password, resettoken } = req.body;

  const permtoken = extractBearerToken(req.headers["authorization"]);

  if (!permtoken) {
    return res.status(401).json({
      success: false,
      responsecode: 401,
      responsemessage: "Invalid Token",
    });
  }

  try {
    const user = await User.findOne({ permtoken });

    if (!user) {
      return res.status(401).json({
        success: false,
        responsecode: 401,
        responsemessage: "User Not Found",
      });
    }

    const restoken = user['resetToken'];

    if (resettoken != restoken) {
      return res.status(402).json({
        success: false,
        responsecode: 402,
        responsemessage: "Incorrect Reset Token",
      });
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    return res.status(200).json({
      success: true,
      responsecode: 200,
      responsemessage: "Password updated successfully",
    });
  } catch (error) {
    logger.error("Error in Updating Password:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Password",
      error: error.message,
    });
  }
};

module.exports = {
  generateresettoken,
  sendtokentoemail,
  changepassword,
};
