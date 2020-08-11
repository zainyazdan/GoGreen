const mongoose = require('mongoose');
console.log("included");
module.exports.ConnectToDatabase = () => {
    console.log("function called");

    const url = 'mongodb://localhost:27017/GoGreen';

    console.log("URL : " + url);

    const connect = mongoose.connect(url);
    // connecting to the database
    connect.then((db) => {
        console.log("Connected to the MongoDB server");
    }, (err) => { console.log(err); });
        
}
