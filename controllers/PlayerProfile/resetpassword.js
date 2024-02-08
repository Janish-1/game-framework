User = require("../../models/user");
const crypto = require("crypto");

const generateresettoken = async (req, res) => {
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

  const x = crypto.randomBytes(20).toString("hex");

  const user = await User.findOne({ permtoken });

  user.resetToken = x;
  user.save();

  return res.status(200).json({
    tokenset: x,
  });
};

module.exports = {
  generateresettoken,
};
