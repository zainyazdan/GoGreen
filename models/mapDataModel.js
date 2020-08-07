const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mapDataSchema = new Schema({
    longitude: {
      type: String,
      required: true
    },
    latitude : {
      type: String,
      required: true
    },
    imagePath: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
}, {
    timestamps: true
});


var MapData = mongoose.model('mapData', mapDataSchema);
module.exports = MapData;


