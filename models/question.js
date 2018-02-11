const mongoose = require('mongoose');
const _ = require('lodash');

var questionSchema = new mongoose.Schema({
  question:{
    type:String,
    required:true
  },
  created_on:{
    type:String,
    required:true
  },
  author:{
    type:String,
    required:true
  },
  type:{
    type:String,
    required:true
  },
  permalink:{
    type:String,
    required:true
  }
});


var Question = mongoose.model('Question',questionSchema);

module.exports = {Question}
