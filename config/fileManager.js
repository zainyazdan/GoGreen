const fs = require('fs')

async function DeleteFile(_path)
{
  // console.log("_path : " + _path);
  
  fs.unlink(_path, (err) =>{
    console.log(err);
  });
}

module.exports.DeleteFile = DeleteFile;