const User = require('../../models/user');
const bcrypt = require('bcrypt');
const { extractBearerToken } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const updateUsername = async (req, res) => {
  const { username } = req.body;

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

    user.name = username;
    await user.save();

    return res.status(200).json({
      success: true,
      responsecode: 200,
      responsemessage: "Username updated successfully",
    });
  } catch (error) {
    logger.error("Error in Updating Username:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Username",
      error: error.message,
    });
  }
};

const updatepassword = async (req, res) => {
  const { password } = req.body;

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

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
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

const logout = async (req, res) => {
  // Fix: was `&&` (auth bypass bug) — corrected to `||`
  const permtoken = extractBearerToken(req.headers['authorization']);

  if (!permtoken) {
    return res.status(400).json({
      'success': false,
      'message': "Invalid Authorization Token",
      'responsecode': 400,
    });
  }

  try {
    const user = await User.findOne({ permtoken });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No User Found"
      });
    }

    user.permtoken = null;
    await user.save();

    return res.status(200).json({
      'success': true,
      'message': "Logout Successful",
      'responsecode': 200,
    });
  } catch (error) {
    logger.error("Error in Logout:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: error.message,
    });
  }
};

module.exports = {
  updateUsername,
  updatepassword,
  logout,
};
