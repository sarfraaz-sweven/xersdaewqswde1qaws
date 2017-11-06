var {User} = require('./../models/user');
var {Admin} = require('./../models/admin');

var authenticate = (req,res,next) => {
  // var token = req.session.auth; //in case of web access
  if(req.body.token)
  {
    User.findByToken(req.body.token).then((user)=>{
      if(!user)
      {
        res.status(401).send({'error':'Unauthoroised Access Denied','code': '0001'});
      }

      req.user = user;
      req.token = req.body.token;
      next();
    })
    .catch((err)=>{
      res.status(401).send({'error':'Unauthoroised Access Denied','code': '0002'});
    });
  }
  else{
    res.status(401).send({'error':'Unauthoroised Access Denied','code': '0002'});
  }
};

var authenticateAdmin = (req,res,next) => {
  // var token = req.session.auth; //in case of web access
  if(req.body.token)
  {
    Admin.findByToken(token).then((admin)=>{
      if(!admin)
      {
        res.status(401).send({'error':'Unauthoroised Access Denied','code': '0003'});
      }
      req.admin = admin;
      req.token = token;
      next();
    })
    .catch((err)=>{
      res.status(401).send({'error':'Unauthoroised Access Denied','code': '0004'});
    });
  }
  else{
    res.status(401).send({'error':'Unauthoroised Access Denied','code': '0002'});
  }
};

module.exports = {authenticate,authenticateAdmin};
