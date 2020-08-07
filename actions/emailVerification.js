const mongoose = require("mongoose");
const VerifyEmail = require("../models/VerifyEmailModel");
const crypto = require("crypto");

// File Modules
const transporter = require("../config/nodemailer")();
const bcryptModule = require("../config/bcryptModule");
const VerifyEmailModel = require("../models/VerifyEmailModel");

const { log } = require("console");




let sendVerifyEmailURL = async (_clientName, _email) => {
  try {
    token = crypto.randomBytes(4).toString("hex");
    // console.log("simple token : " + token);


    let hashedToken = await bcryptModule.ComputeSaltHash(token);

    // console.log("hashedToken : " + hashedToken);

    let verification = new VerifyEmailModel({
      userEmail: _email,
      verifyEmailToken: hashedToken,
    });
    
    await verification.save();

    let url = _clientName + `/emailverification` + "/" + _email + "/" + token;
    // console.log("URL : " + url);


    let mailOptions = 
    {
      from: "zainyazdan54321@gmail.com",
      to: _email,
      subject: "Email Verification",
      html:
        "<h4><b>Thank you for registering as a MingaProject member</b></h4>" +
        "<p>Please verify your Email to complete the registration<br>To verify your email, open the link:</p><br><br>" +
        `<a href=${url}>` +
        url +
        "</a>" +
        "<br><br>" +
        "Thanks<br>" +
        "The Minga Project Team<br><br>" +
        "12-39 Presidente Borreo<br>" +
        "Cuenca, Ecuador 10107",
    };
    
    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);; 
    // console.log("info : " , info);

    return true;

  } catch (error) {
      console.error(error);
    return false;
  }
};

let verifyEmail = async (email, verifyEmailToken) => {
  try {
    //let word = new ResetPassword({ userEmail: email, resetPasswordToken: resetPassowrdPin });
    let verify = await VerifyEmailModel.findOne({ userEmail: email });
    // console.log(verify);
    if (!verify) return false;

    // console.log("verifyEmailToken : " + verifyEmailToken);
    // console.log("verify.verifyEmailToken : " + verify.verifyEmailToken);


    let validPassword = bcryptModule.ComputeSaltHash( verifyEmailToken, verify.verifyEmailToken);



    // let validPassword = bcryptModule.ComputeSaltHash() bcrypt.compareSync(
    //   verifyEmailToken,
    //   verify.verifyEmailToken
    // ); 
    //user password is stored as hashed

    if (!validPassword) return false;

    verify.verified = true;

    await verify.save();

    return true;

  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.sendVerifyEmailURL = sendVerifyEmailURL;
module.exports.verifyEmail = verifyEmail;
