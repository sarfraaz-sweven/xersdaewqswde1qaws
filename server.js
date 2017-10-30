const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const sha1 = require('sha1');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Admin} = require('./models/admin');
var {authenticate,authenticateAdmin} = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());

app.get('/',(req,res)=>{
  res.send("Hola");
});

app.post('/signin',(req,res)=>{
  var body = _.pick(req.body,['name','email','password']);
  var user = new User(body);

  user.save().then(()=>{
    return user.generateAuthToken();
  })
  .then((token)=>{
    res.header('x-auth',token).send();
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.post('/admin/signin',(req,res)=>{
  var body = _.pick(req.body,['name','email','password']);
  var admin = new Admin(body);

  admin.save().then(()=>{
    return admin.generateAuthToken();
  })
  .then((token)=>{
    res.header('x-auth',token).send(admin);
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.post('/admin/login',(req,res)=>{
  var body = _.pick(req.body,['email','password']);

  Admin.findByCredentials(body.email,body.password).then((admin)=>{
    return admin.generateAuthToken();
  })
  .then((token)=>{
    res.header('x-auth',token).status(200).send();
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.delete('/admin/logout',authenticateAdmin,(req,res)=>{
  req.admin.removeToken(req.token).then(()=>{
    res.status(200).send();
  },()=>{
    res.status(400).send();
  });
});

app.post('/login',(req,res)=>{
  var body = _.pick(req.body,['email','password']);

  User.findByCredentials(body.email,body.password).then((user)=>{
    return user.generateAuthToken();
  })
  .then((token)=>{
    res.header('x-auth',token).status(200).send();
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.delete('/logout',authenticate,(req,res)=>{
  req.user.removeToken(req.token).then(()=>{
    res.status(200).send();
  },()=>{
    res.status(400).send();
  });
});

app.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user);
});

app.post('/generate_reset_password',(req,res)=>{
  var body = _.pick(req.body,['email']);

  User.findOne(body).then((user)=>{
      if(!user)
        return Promise.reject({'error':'This email address does not belong to any account on this server!'});
      return user.generateResetToken();
  })
  .then((token)=>{
      console.log('Received : '+token)
      res.send({'token':token});
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.get('/reset_password/:token',(req,res)=>{
  User.validateResetToken(req.params.token).then((user)=>{
    res.status(200).send({'name':user.name,'token':req.params.token});
  })
  .catch((err)=>{
    res.status(400).send({'error':"Bad request, Either the link has been altered or expired!"});
  });
});

app.patch('/change_password_after_reset/',(req,res)=>{
  var body = _.pick(req.body,['password','token']);
  User.resetByToken(body.password,body.token).then((user)=>{
    res.status(200).send({'message':"Password changed successfully"});
  })
  .catch((err)=>{
    res.status(400).send({'error':"Bad request, Either the link has been altered or expired!",'code':err});
  });
});


app.listen(3000,(err)=>{
  console.log('Started server on port 3000');
});
