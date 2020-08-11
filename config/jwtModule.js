const fs = require("fs");
const jwt = require("jsonwebtoken");

require('dotenv').config();


// const appRoot = require("app-root-path");

// use 'utf8' to get string instead of byte array  (512 bit key)

// var privateKEY = fs.readFileSync(`${appRoot}/config/jwt/private.key`, "utf8");
// var publicKEY = fs.readFileSync(`${appRoot}/config/jwt/public.key`, "utf8");


require('dotenv').config();

// var privateKEY = process.env.jwtPrivateKey;
// var publicKEY = process.env.jwtPublicKey;



exports.sign = async function (payload, id) {
  // console.log("payload : " , payload);
  // console.log("id : " + id);

  let signOptions = {
    // issuer: "mingaproject.com",
    // subject: `${id}`,
    // audience: "mingaproject.com",
    // algorithm: "RS256",
    expiresIn: process.env.TOKEN_EXPIRY_TIME
  };
  try {
    return await jwt.sign(payload, process.env.TOKEN_KEY , signOptions);

} catch (error) {
  console.log("try catch error : " , error);
  return;
}
  // return await jwt.sign(payload, privateKEY, signOptions);TOKEN_PRIVATE_KEY
};

exports.verify = async function (token) {
  try {

    // let verifyOptions = {
    //   issuer: "mingaproject.com",
    //   audience: "mingaproject.com",
    //   // ignoreExpiration: true,
    //   // ignoreNotBefore: true,
    //   algorithm: ["RS256"],
    // };


    // return jwt.verify(token, publicKEY, verifyOptions);

    // return jwt.verify(token, "1234-5678" , verifyOptions);
    return jwt.verify(token, process.env.TOKEN_KEY);

  } catch (error) {
    return;
  }
};
