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
    type:String,
    required:true
  },
  purchased:{
    type:String,
    required:true
  },
  started:{
    type:String,
    required:true
  },
  completed:{
    type:String,
    required:true
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
  state:{
    type: Number,
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
  sessions:[
      {
        set_on:{
            type: String,
            required: true
        },
        status:{
            type: Boolean,
            required: true
        },
        start:{
            type: String
        },
        end:{
            type: String
        },
        training_points:{
            type: String
        },
        remarks:{
            type: String
        },
        feedback:{
            type: String
        },
        loc_start:{
            type: String
        },
        loc_end:{
            type: String
        }
      }
  ]

});


var Package = mongoose.model('Package',packageSchema);

module.exports = {Package}
