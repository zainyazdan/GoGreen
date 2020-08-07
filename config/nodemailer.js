const nodemailer = require("nodemailer");
require('dotenv').config();

// let transporter = () =>
//   nodemailer.createTransport({
//     // service: 'gmail',
//     host: "motherbrain.grayhathosting.com",
//     port: 465,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: "mingaproject@grayhat.link",
//       pass: process.env.MAIL_SERVER_PASSWORD,
//     },
// });

let transporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
        // user: 'zainyazdan54321@gmail.com',
        // pass: '321chechup'
    }
});


  
module.exports = transporter;