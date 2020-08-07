// node modules
var express = require('express');
const mongoose = require('mongoose');
var mapRouter = express.Router();

const MapDataModel = require('../models/mapDataModel')



// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function(req, file, cb) {
//     cb(null, new Date().toISOString() + file.originalname);
//   }
// });



// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, './uploads/');
//   },
//   filename: function(req, file, cb) {
//     cb(null, new Date().toISOString() + file.originalname);
//   }
// });



// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5
//   },
//   // fileFilter: fileFilter
// });



// Method 2

const multer = require('multer');
const { log } = require('debug');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images' );
    },

    filename: (req, file, cb) => {
        // console.log("File name : " + Date.now() + file.originalname);
        cb(null,  Date.now() + '-' + file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ 
      storage: storage,
      limits: {fileSize: 1024 * 1024 * 5},  // maximum file size is 5 MB
      fileFilter: imageFileFilter
    });



mapRouter.route('/map_points')
.get( async (req, res, next) => {

  // for testing
  req.user = {};
  req.user.id = '5f2b2b535107e40378108adf';

  let data = await MapDataModel.find({userId: req.user.id}).select('longitude latitude imagePath -_id');

  if(data.length == 0)
  {
    return res.status(200)
  .json({success:false, message:"No record found against this user id"});
  }
  
  res.status(200)
  .json({success:true, data:data});

})
.post(upload.single('imageFile') , async (req, res, next) => {
  
  // for testing
  req.body.userId = '5f2b2b535107e40378108adf';

  req.body.imagePath = req.file.path;
  console.log("req.file.path : " + req.file.path);

  await MapDataModel.create(req.body);

  res.status(200)
  .json({success:"true", message:"Data and image file successfully saved"});
});














module.exports = mapRouter;
