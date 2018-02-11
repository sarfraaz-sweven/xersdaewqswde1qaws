const mongoose = require('mongoose');
const _ = require('lodash');

var trainingSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  icon:{
    type:String,
    required:true
  },
  element:{
    type:String,
    required:true
  },
  spec_req:{
    type:String,
    required:true
  },
  sessions:{
    type:String,
    required:true
  },
  duration:{
    type:String,
    required:true
  },
  time_per_session:{
    type: String,
    required:true
  },
  cost:{
    type: Number,
    required:true
  },
  status:{
    type: Boolean,
    required: true,
    default: true
  }
});


var Training = mongoose.model('Training',trainingSchema);

module.exports = {Training}
