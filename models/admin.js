const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
var bcrypt = require('bcrypt');

var adminSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true,
    minLength:1
  },
  email:{
    type:String,
    required:true,
    trim:true,
    minLength: 1,
    unique:true,
    validate: {
        validator: validator.isEmail,
        message:'{value} is not a valid email'
    }
  },
  password:{
    type:String,
    required:true
  },
  tokens:[{
    access:{
      type:String,
      required:true
    },
    token:{
      type:String,
      required:true
    }
  }]
});



adminSchema.methods.generateAuthToken = function(){
  var admin = this;
  var access = 'admin';
  var token = jwt.sign({_id:admin._id.toHexString(),access},'abc123').toString();

  admin.tokens.push({access,token});
  return admin.save().then(()=>{
    return token;
  });
};

adminSchema.statics.findByToken = function(token){
  var Admin = this;
  var decoded;

  try{
    decoded = jwt.verify(token,'abc123');
  } catch(e){
    return Promise.reject();
  }

  return Admin.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'admin'
  });
};

adminSchema.statics.findByCredentials = function(email,password){
  var Admin = this;

  return Admin.findOne({email}).then((admin)=>{

    if(!email || !password)
      return Promise.reject({"error":"Please enter Email Address & Password to continue."});

    if(!validator.isEmail(email))
      return Promise.reject({"error":"Invalid Email address passed."});

    if(!admin)
      return Promise.reject({"error":"Authentication failed! Please check your credentials & try again."});

    return new Promise((resolve,reject)=>{
      bcrypt.compare(password, admin.password).then(function(res) {
        if(res)
          return resolve(admin);
        else {
          return reject({"error":"Authentication failed! Please check your credentials & try again."});
        }
      });
    });
  });
};

adminSchema.statics.getUsers = function(User){
  return User.find({},'_id name email');
}

adminSchema.statics.stateChange = function(user, active){
  return user.update({'is_active':active});
}

adminSchema.methods.removeToken = function(token){
  var admin = this;

  return admin.update ({
    $pull:{
      tokens:{token}
    }
  });
}

adminSchema.pre('save',function(next){
  var admin = this;
  if(admin.isModified('password')){
    bcrypt.hash(admin.password, 10).then(function(hash) {
      admin.password = hash;
      next();
    });
  } else {
    next();
  }
});

var Admin = mongoose.model('Admin',adminSchema);

module.exports = {Admin};
