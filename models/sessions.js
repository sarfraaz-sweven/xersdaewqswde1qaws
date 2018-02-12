const mongoose = require('mongoose');
const _ = require('lodash');

var sessionSchema = new mongoose.Schema({
    package:{
        type: String,
        required:true
    },
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
});

var Session = mongoose.model('Session',sessionSchema);

module.exports = {Session}