const User = require("../../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

  const x = crypto.randomBytes(50).toString("hex");

  const user = await User.findOne({ permtoken });

  user.resetToken = x;
  user.save();

  return res.status(200).json({
    tokenset: x,
  });
};

const sendtokentoemail = async (req, res) => {
  // Confirm Permanent Token
  const authHeader = req.headers["authorization"];
  if (!authHeader && !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      responsecode: 401,
      responsemessage: "Invalid Token",
    });
  }

  const permtoken = authHeader.split(' ')[1];

  const verifydata = await User.findOne({ permtoken });
  const verification = verifydata['resetToken'];

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "janishgaming01@gmail.com",
      pass: "zirz ihpo cshs qylo",
    },
  });
  
  var mailOptions = {
    from: "janishgaming01@gmail.com",
    to: "janish.pancholi11@gmail.com",
    subject: "Verification Code",
    text: "Code:" + verification,
  };

  transporter.sendMail(mailOptions,function(error,info){
    if (error) {
      console.log(error);
      return res.status(401).json({
        "success":true,
        "responsecode":401,
        "responsemessage":"Email Sent Failed"
      });
    } else {
      console.log('Email Sent: '+ info.response);
      return res.status(200).json({
        "success":true,
        "responsecode":200,
        "responsemessage":"Email Sent Successfully"
      });
    }
  });
};

const changepassword = async (req,res) => {
  const { password,resettoken } = req.body;

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
    const restoken = user['resetToken'];

    if (!user) {
      return res.status(401).json({
        success: false,
        responsecode: 401,
        responsemessage: "User Not Found",
      });
    }

    if (resettoken != restoken){
      return res.status(402).json({
        success: false,
        responsecode: 402,
        responsemessage: "Incorrect Reset Token",
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
}

module.exports = {
  generateresettoken,
  sendtokentoemail,
  changepassword,
};
