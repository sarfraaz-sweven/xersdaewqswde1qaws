const mongoose = require('mongoose');
const _ = require('lodash');

var termsSchema = new mongoose.Schema({
  condition:{
    type:String,
    required:true
  }
});


var Terms = mongoose.model('Terms',termsSchema);

module.exports = {Terms}
