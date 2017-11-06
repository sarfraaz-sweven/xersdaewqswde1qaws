const express = require('express');
const _ = require('lodash');

const {authenticateAdmin} = require('./../middleware/authenticate');
const {Admin} = require('./../models/admin');

const admin_routes = express.Router();

admin_routes.get('/admin/signin',(req,res)=>{
  res.render('admin/signin.html',{
    'pageTitle':'Admin Signin'
  });
});

admin_routes.post('/admin/signin',(req,res)=>{
  var body = _.pick(req.body,['name','email','password']);
  var admin = new Admin(body);

  admin.save().then(()=>{
    return admin.generateAuthToken();
  })
  .then((token)=>{
    req.session.auth = token;
    req.session.auth.maxAge = 36000000;
    res.header('x-auth',token).send(token);
  })
  .catch((err)=>{
    res.status(400).send({'error':err,'code':'0011'});
  });
});

admin_routes.get('/admin/login',(req,res)=>{
  res.render('admin/login.html',{
    'pageTitle':'Admin Login'
  });
});

admin_routes.post('/admin/login',(req,res)=>{
  var body = _.pick(req.body,['email','password']);

  Admin.findByCredentials(body.email,body.password).then((admin)=>{
    return admin.generateAuthToken();
  })
  .then((token)=>{
    req.session.auth = token;
    req.session.auth.maxAge = 36000000;
    res.header('x-auth',token).status(200).send();
  })
  .catch((err)=>{
    res.status(400).send({'error':err,'code':'0012'});
  });
});

admin_routes.get('/admin',authenticateAdmin,(req,res)=>{
  res.render('admin/dashboard.html',{
    'pageTitle':'Admin Dashboard',
    'name':req.admin.name
  });
});

admin_routes.get('/admin/users',authenticateAdmin,(req,res)=>{
  console.log("Pass");
  Admin.getUsers(User).then((users)=>{
    var u;
    if(users)
      u = users;
    console.log(users);
    res.render('admin/users.html',{
      'users':u,
      'pageTitle':'Users'
    });
  })
  .catch((err)=>{
    res.status(401).send({'error':err,'code':'0013'});
  });
});

admin_routes.patch('/admin/users/changeState',authenticateAdmin,(req,res)=>{

  User.findById(req.body.id).then((user)=>{
    var state;
    if(req.body.active)
      state="Activate";
    else {
      state="Deactivate";
    }

    if(!user)
      return new Promise.reject("The user with the id you provided, doesn't exist");

      Admin.stateChange(user,req.body.active).then(()=>{
        res.send({'message':'User '+state+'d Successfully'});
      })
      .catch((err)=>{
        new Promise.reject(err);
      });
  })
  .catch((err)=>{
    res.status(400).send({'error':err,'code':'0014'});
  });
});

admin_routes.delete('/admin/logout',authenticateAdmin,(req,res)=>{
  req.admin.removeToken(req.token).then(()=>{
    res.status(200).send({'message':'Admin Logged out Successfully'});
  },()=>{
    res.status(400).send({'message':'Admin Logged out Successfully'});
  });
});

module.exports = admin_routes;
