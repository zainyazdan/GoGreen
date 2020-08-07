// node modules
var express = require('express');
const mongoose = require('mongoose');
var mapRouter = express.Router();
const multer = require('multer');
const fs = require('fs')



// File modulss

const MapDataModel = require('../models/mapDataModel')
const fileManager = require('../config/fileManager')



// Multer configuration

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



mapRouter.route('/map_points/:userId')
.get( async (req, res, next) => {

  // for testing
  req.user = {};
  req.user.id = req.params.userId;
  // req.user.id = '5f2b2b535107e40378108adf';

  let data = await MapDataModel.find({userId: req.user.id}).
  select('plantNumber longitude latitude imagePath updatedAt -_id')
  .sort({'updatedAt': 1});

  if(data.length == 0)
  {
      return res.status(200)
    .json({success:false, message:"No record found against this user id"});
  }
  
  res.status(200)
  .json({success:true, data:data});
})
.put(  (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on map/map_points');
})
.post( upload.array('imageFile', 10) , async (req, res, next) => {
  // .post( upload.array('uploadedImages', 10), upload.single('imageFile') , async (req, res, next) => {


  // console.log("req.files : " + req.files); 
  // console.log("req.files.length : " + req.files.length); 
  
  req.body.imagePath = [];
  
  for (let i = 0; i < req.files.length; i++) {
    req.body.imagePath.push(req.files[i].path); 
  }

  
  // for (let i = 0; i < req.body.imagePath.length; i++) {
  //     console.log(" req.body.imagePath : "  +   req.body.imagePath[i]);
  // }


   // for testing
  // req.body.userId = '5f2b2b535107e40378108adf';
  req.body.userId = req.params.userId;

  // let result = await MapDataModel.find({userId: req.body.userId});

  // req.body.plantNumber = result.length + 1;

  // console.log("req.body.plantNumber : " + req.body.plantNumber);

  await MapDataModel.create(req.body);

  res.status(200)
  .json({success:"true", message:"Data and images successfully saved"});
})
.delete(  async (req, res, next) => {

   // for testing
  // req.body.userId = '5f2b2b535107e40378108adf';
  req.body.userId = req.params.userId;

  let result = await MapDataModel.find( {userId: req.body.userId} ).select('imagePath -_id');
  
  if(result.length == 0){
    return res.status(200)
    .json({success:false, message:"No record found to be deleted against this user_id"});
  }
  

  // extracting images paths
  let imagePaths = [];
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].imagePath.length; j++) {
      imagePaths.push( result[i].imagePath[j] );
    }
  }
  
  // for (let i = 0; i < imagePaths.length; i++) {
  //   console.log("imagePaths ["+i+"] : " + imagePaths[i]);
  // }

  // console.log("imagePaths.length: " , imagePaths.length);
 
  
  let result2 = await MapDataModel.deleteMany({userId: req.body.userId})
  // console.log("result: " , result);

  if(result2.n == 0){
    return res.status(200)
      .json({success:false, message:"No record found to be deleted against this user_id"});
  }

  for (let i = 0; i < imagePaths.length; i++) {
    console.log("filePath : " + imagePaths[i] );
    await fileManager.DeleteFile(imagePaths[i] );
  }

  return res.status(200)
    .json({success:true , message: result2.n + " Map point/s successfully deleted"});

});


mapRouter.route('/map_points/:userId/:plant_id')
.get( async (req, res, next) => {

  // for testing
  req.user = {};
  // req.user.id = '5f2b2b535107e40378108adf';
  req.user.id = req.params.userId;

  let data = await MapDataModel.find({userId: req.user.id, _id: req.params.plant_id}).
    select('plantNumber longitude latitude imagePath updatedAt -_id');

  if(data.length == 0)
  {
    return res.status(200)
      .json({success:false, message:"No record found against this user id and plant_number"});
  }
  
  res.status(200)
  .json({success:true, data:data});
})
.put(async (req, res, next) => {

  let result = await MapDataModel.findByIdAndUpdate( 
    { _id: req.params.plant_id} ,
    req.body    
  );
  log("result : ", result);

  res.statusCode = 403;
  res.end('PUT operation not supported on map/map_points');
  
})
.post( async (req, res, next) => {

  res.statusCode = 403;
  res.end('POST operation not supported on map/map_points/:plant_number');

})
.delete(  async (req, res, next) => {
  req.body.userId= req.params.userId;

   // for testing
  // req.body.userId = '5f2b2b535107e40378108adf';
  req.body.userId = req.params.userId;

  let result = await MapDataModel.find( {userId: req.body.userId} ).select('imagePath -_id');
  
  if(result.length == 0){
    return res.status(200)
    .json({success:false, message:"No record found to be deleted against this user_id"});
  }
  

  // extracting images paths
  let imagePaths = result[0].imagePath;

  for (let i = 0; i < imagePaths.length; i++) {

    console.log("imagePaths ["+i+"] : " + imagePaths[i] );

  }

  // console.log("imagePaths.length: " , imagePaths.length);
  
  let result2 = await MapDataModel.deleteOne({userId: req.body.userId, _id: req.params.plant_id})
  // console.log("result: " , result);

  if(result2.n == 0){
    return res.status(200)
      .json({success:false, message:"No record found to be deleted against this user_id"});
  }

  for (let i = 0; i < imagePaths.length; i++) {
    console.log("filePath : " + imagePaths[i] );
    await fileManager.DeleteFile(imagePaths[i] );
  }

  return res.status(200)
    .json({success:true , message: "Map point successfully deleted"});
});



mapRouter.route('/total_trees_planted/:userId')
.get( async (req, res, next) => {

  // for testing
  req.user = {};
  // req.user.id = '5f2b2b535107e40378108adf';
  req.user.id = req.params.userId;
  let data = await MapDataModel.find({userId: req.user.id});
  if(data.length == 0)
  {
    return res.status(200)
      .json({success:false, message:"No record found against this user id"});
  }
  res.status(200)
  .json({success:true, total_plants:data.length});
})













module.exports = mapRouter;
