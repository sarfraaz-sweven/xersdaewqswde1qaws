const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const sha1 = require('sha1');
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
        message:'%{value} is not a valid email'
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
  var token = jwt.sign({_id:user._id.toHexString()},'abc123').toString();

  user.reset_token.value = token;
  user.reset_token.expired_at = Date.now() + 1800000;
  console.log(user);
  return user.save().then(()=>{
    return token;
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

userSchema.statics.resetByToken = function(token,password){
  var User = this;
  var decoded;

  try{
    decoded = jwt.verify(token,'abc123');
  } catch(e){
    return Promise.reject(e);
  }

  var cur_date = Date.now();

  return User.findOneById(decoded._id).then((doc)=>{
    if(doc.reset_token.value !== token || doc.reset_token.expired_at > cur_date)
      return new Promise.reject("1");

      User.findByIdAndUpdate(doc._id,{$set:{'password':password}},{new:true}).then((user)=>{
        if(!todo)
          return new Promise.reject("2");

          new Promise.resolve();
      });
  })
  .catch((err)=>{
    return new Promise.reject("3");
  })
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
      if(sha1(password) == user.password)
        return resolve(user);
      else
        return reject({"error":"Authentication failed! Please check your credentials & try again."});
    });
  });
};

userSchema.pre('save',function(next){
  var user = this;
  if(user.isModified('password')){
    user.password = sha1(user.password);
    next();
  } else {
    next();
  }
});

var User = mongoose.model('User',userSchema);

module.exports = {User}
