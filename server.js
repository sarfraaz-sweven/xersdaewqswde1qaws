const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const sha1 = require('sha1');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

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
    res.header('x-auth',token).send(user);
  })
  .catch((err)=>{
    res.status(400).send(err);
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
      return user.generateResetToken();
  })
  .then((token)=>{
      res.send(token);
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.patch('/change_password_after_reset/',(req,res)=>{
  var body = _.pick(req.body,['password','token']);

  if(!body.password)
    res.status(400).send({'error':"Please enter new password to update!"});

  User.resetByToken(req.params.token,body.password).then((user)=>{
    res.status(200).send(user);
  })
  .catch((err)=>{
    res.status(400).send({'error':"Password reset failed, Either the link has been altered or expired!","code":err});
  });
});

app.listen(3000,(err)=>{
  console.log('Started server on port 3000');
});
