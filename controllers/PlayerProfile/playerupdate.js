User = require('../../models/user');
const crypto = require("crypto");

const updateUsername = async (req, res) => {

  const { username } = req.body;

  // Confirm Permanent Token
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      responsecode: 401,
      responsemessage: "Invalid Token",
    });
  }

  const permtoken = authHeader.split(" ")[1];

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
    console.error("Error in Updating Username:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Username",
      error: error.message,
    });
  }
};

const updatepassword = async (req, res) => {
  const { password } = req.body;

  // Confirm Permanent Token
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      responsecode: 401,
      responsemessage: "Invalid Token",
    });
  }

  const permtoken = authHeader.split(" ")[1];

  try {
    const user = await User.findOne({ permtoken });

    if (!user) {
      return res.status(401).json({
        success: false,
        responsecode: 401,
        responsemessage: "User Not Found",
      });
    }

    // Encrypt the password using crypto
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      responsecode: 200,
      responsemessage: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in Updating Password:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Password",
      error: error.message,
    });
  }
};

const logout = async (req,res) => {
  const authHeader = req.headers['authorization'];

  if(!authHeader && authHeader.startsWith("Bearer ")){
    return res.status(400).json({
      'success':false,
      'message': "Invalid Authorization Token",
      'responsecode': 400,
    });
  }

  const permtoken = authHeader.split(' ')[1];

  try{
    const user = await User.findOne({ permtoken });

    if (!user){
      return res.status(400).json({
        success: false,
        message: "No User Found"
      });
    }

    user.permtoken = null;
    await user.save();
    
    return res.status(200).json({
      'success':true,
      'message': "Logout Successful",
      'responsecode': 200,
    });
  } catch (error) {
    console.error("Error in Updating Password:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Password",
      error: error.message,
    });
  }
};

module.exports = {
  updateUsername,
  updatepassword,
  logout,
};
