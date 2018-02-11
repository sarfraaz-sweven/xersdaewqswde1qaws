const mongoose = require('mongoose');
const _ = require('lodash');

var blogSchema = new mongoose.Schema({
  permalink:{
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
  category:{
    type:String,
    required:true
  },
  title:{
    type:String,
    required:true
  },
  blog_text:{
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  tags:{
    type:String,
    required:true
  },
  featured:{
    type: String,
    required: true,
    default: false
  }
});


var Blog = mongoose.model('Blog',blogSchema);

module.exports = {Blog}
