const mongoose = require('mongoose');
const _ = require('lodash');

var reviewSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  profile:{
    type:String,
    required:true
  },
  review:{
    type:String,
    required:true
  },
  status:{
    type:Boolean,
    default:true
  }
});


var Review = mongoose.model('Review',reviewSchema);

module.exports = {Review}
