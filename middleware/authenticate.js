var {User} = require('./../models/user');
var {Admin} = require('./../models/admin');

var authenticate = (req,res,next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user)=>{
    if(!user)
    {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  })
  .catch((err)=>{
+    res.status(401).send(err);
  });
};

var authenticateAdmin = (req,res,next) => {
  var token = req.header('x-auth');

  Admin.findByToken(token).then((admin)=>{
    if(!admin)
    {
      return Promise.reject();
    }
    console.log(admin);
    req.admin = admin;
    req.token = token;
    next();
  })
  .catch((err)=>{
    res.status(401).send("errrr");
  });
};

module.exports = {authenticate,authenticateAdmin};
