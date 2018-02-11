const mongoose = require('mongoose');
const _ = require('lodash');

var commentSchema = new mongoose.Schema({
  created_on:{
    type:String,
    required:true
  },
  author:{
    type:String,
    required:true
  },
  text:{
    type:String,
    required:true
  },
  blog:{
    type:String,
    required:true
  }
});


var Comment = mongoose.model('Comment',commentSchema);

module.exports = {Comment};
