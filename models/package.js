const mongoose = require('mongoose');
const _ = require('lodash');

var packageSchema = new mongoose.Schema({
  trainee:{
    type:String,
    required:true
  },
  training:{
    type:String,
    required:true
  },
  trainer:{
    type:String
  },
  purchased:{
    type:String,
    required:true
  },
  started:{
    type:String
  },
  completed:{
    type:String
  },
  address1:{
    type:String,
    required:true
  },
  address2:{
    type:String
  },
  city:{
    type: String,
    required:true
  },
  zip:{
    type: String,
    required:true
  },
  state:{
    type: String,
    required:true
  },
  country:{
    type: String,
    required: true
  },
  approved:{
    type: Boolean,
    required: true
  },
  amount:{
    type: Number
  },
  payment:{
    type: String
  }
});


var Package = mongoose.model('Package',packageSchema);

module.exports = {Package}
