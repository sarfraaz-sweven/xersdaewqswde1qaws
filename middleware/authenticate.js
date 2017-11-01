var {User} = require('./../models/user');
var {Admin} = require('./../models/admin');

var authenticate = (req,res,next) => {
  var token = req.session.auth;

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
    res.status(401).send(req.session.token);
  });
};

var authenticateAdmin = (req,res,next) => {
  var token = req.session.auth;
  console.log("Here",token);
  Admin.findByToken(token).then((admin)=>{
    if(!admin)
    {
      res.status(401).send("Unauthoroised Access Denied");
    }
    req.admin = admin;
    req.token = token;
    next();
  })
  .catch((err)=>{
    res.status(401).send(err);
  });
};

module.exports = {authenticate,authenticateAdmin};
