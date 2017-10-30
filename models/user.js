const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
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
  is_verified:{
    type:Boolean,
    default:false
  },
  is_active:{
    type:Boolean,
    default:false
  },
  otp:{
    value:{
      type:String
    },
    expired_at:{
      type:String
    }
  },
  reset_token:{
    value:{
      type:String
    },
    expired_at:{
      type:String
    }
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

userSchema.methods.toJSON = function(){
  var user  = this;
  var userObject = user.toObject();

  return _.pick(userObject,['_id','name','email']);
}

userSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id:user._id.toHexString(),access},'abc123').toString();

  user.tokens.push({access,token});
  return user.save().then(()=>{
    return token;
  });
};

userSchema.methods.generateResetToken = function(){
  var user = this;
  var access = 'auth';
  var token;

  return bcrypt.hash(user._id.toHexString(), 10).then(function(hash) {
    user.reset_token.value = hash;
    token = hash;
    user.reset_token.expired_at = Date.now() + 1800000;
    return user.save().then(()=>{
      console.log('Passed : '+token)
      return token;
    });
  });

};

userSchema.methods.removeToken = function(token){
  var user = this;

  return user.update ({
    $pull:{
      tokens:{token}
    }
  });
}

userSchema.statics.findByToken = function(token){
  var User = this;
  var decoded;

  try{
    decoded = jwt.verify(token,'abc123');
  } catch(e){
    return Promise.reject();
  }

  return User.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
};

userSchema.statics.validateResetToken = function(token){
  var User = this;
  var decoded;

  return User.findOne({'reset_token.value':token,'reset_token.expired_at': { $gt : Date.now() } });
};

userSchema.statics.resetByToken = function(password,token){
  var User = this;
  var decoded;
  return bcrypt.hash(password, 10).then(function(hash) {
    return User.findOneAndUpdate({'reset_token.value':token,'reset_token.expired_at': { $gt : Date.now() } },{$set:{'password':hash}},{new:true});
  });
};

userSchema.statics.findByCredentials = function(email,password){
  var User = this;

  return User.findOne({email}).then((user)=>{

    if(!email || !password)
      return Promise.reject({"error":"Please enter Email Address & Password to continue."});

    if(!validator.isEmail(email))
      return Promise.reject({"error":"Invalid Email address passed."});

    if(!user)
      return Promise.reject({"error":"Authentication failed! Please check your credentials & try again."});

    return new Promise((resolve,reject)=>{
      bcrypt.compare(password, user.password).then(function(res) {
        if(res)
          return resolve(user);
        else {
          return reject({"error":"Authentication failed! Please check your credentials & try again."});
        }
      });
    });
  });
};

userSchema.pre('save',function(next){
  var user = this;
  if(user.isModified('password')){
    bcrypt.hash(user.password, 10).then(function(hash) {
      user.password = hash;
      next();
    });
  } else {
    next();
  }
});


var User = mongoose.model('User',userSchema);

module.exports = {User}
