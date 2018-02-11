const mongoose = require('mongoose');
const _ = require('lodash');

var answerSchema = new mongoose.Schema({
  answer:{
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
  question:{
    type:String,
    required:true
  }
});


var Answer = mongoose.model('Answer',answerSchema);

module.exports = {Answer}
