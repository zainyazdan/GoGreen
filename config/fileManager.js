const fs = require('fs')
const multer = require('multer')


// Multer configuration (for map point)

const storage1 = multer.diskStorage({
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
      return cb(new Error('You can only upload image files!'), false);
  }
  cb(null, true);
};

const upload1 = multer({ 
  storage: storage1,
  limits: {fileSize: 1024 * 1024 * 5},  // maximum file size allowed is 5 MB
  fileFilter: imageFileFilter
});


module.exports.uploadMapImage = upload1;



// Multer configuration (for profile picture)

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images/profile_pics' );
  },
  filename: (req, file, cb) => {
      // console.log("File name : " + Date.now() + file.originalname);
      cb(null,  Date.now() + '-' + file.originalname)
  }
});


const upload2 = multer({ 
  storage: storage2,
  limits: {fileSize: 1024 * 1024 * 5},  // maximum file size allowed is 5 MB
  fileFilter: imageFileFilter
});


module.exports.uploadProfileImage = upload2;




async function DeleteFile(_path)
{
  // console.log("_path : " + _path);
  
  fs.unlink(_path, (err) =>{
    console.log(err);
  });
}
module.exports.DeleteFile = DeleteFile;







