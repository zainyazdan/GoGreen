const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mapPointsSchema = new Schema({
    longitude: {
      type: String,
      required: true
    },
    latitude : {
      type: String,
      required: true
    },
    date : {
      type: Date,
      required: true
    },
    imagePath: {
      type: [String],
      required: true,
      unique: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
}
// , 
// {
//     timestamps: true
// }
);



var MapPoints = mongoose.model('mapPoint', mapPointsSchema);
module.exports = MapPoints;


// var thingSchema = new Schema({..}, { timestamps: { createdAt: 'created_at' } });


