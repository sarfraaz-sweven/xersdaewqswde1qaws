const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const hbs = require('hbs');
const session = require('express-session');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Admin} = require('./models/admin');
var {authenticate,authenticateAdmin} = require('./middleware/authenticate');

var app = express();

hbs.registerPartials(__dirname+'/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'top Secret',
  resave:false,
  saveUninitialized:true
}));

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(express.static(__dirname + '/public'));

app.get('/',(req,res)=>{
  res.render("home.html",{
    'pageTitle':'Welcome to Home'
  });
});

app.get('/signin',(req,res)=>{
  res.render("signin.html",{
    'pageTitle':'Welcome to Home'
  });
});

app.get('/login',(req,res)=>{
  res.render("login.html",{
    'pageTitle':'Welcome to Home'
  });
});

app.post('/signin',(req,res)=>{
  var body = _.pick(req.body,['name','email','password','confirm_password']);
  var user = new User(body);

  user.save().then(()=>{
    return user.generateOTP();
  })
  .then((token)=>{
    res.send(token);
  })
  .catch((err)=>{
    if(err.errors)
    {
      if(err.errors.name)
        return res.status(400).send({"error":"Please enter the name"});
      if(err.errors.email)
        return res.status(400).send({"error":"Please enter a valid email address"});
      if(err.errors.password)
        return res.status(400).send({"error":"Password must be at least 6 characters long"});
    }
    if(err.code)
    {
      return res.status(400).send({"error":"Sorry, email you entered is already in use. Please try with another email."});
    }
    console.log(err);
    res.status(400).send(err);
  });
});

app.post('/verify_otp',(req,res)=>{
  var body = _.pick(req.body,['otp','token']);

  User.
})

app.post('/admin/signin',(req,res)=>{
  var body = _.pick(req.body,['name','email','password']);
  var admin = new Admin(body);

  admin.save().then(()=>{
    return admin.generateAuthToken();
  })
  .then((token)=>{
    req.session.auth = token;
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
    req.session.auth = token;
    res.header('x-auth',token).status(200).send();
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.get('/admin/users',authenticateAdmin,(req,res)=>{
  Admin.getUsers(User).then((users)=>{
    if(!users)
      res.send("No Users Found");
    res.send(users);
  })
  .catch((err)=>{
    res.status(404).send(err);
  });
});

app.patch('/admin/users/changeState',authenticateAdmin,(req,res)=>{

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
    res.status(400).send({'error':err});
  });
});

app.delete('/admin/logout',authenticateAdmin,(req,res)=>{
  req.admin.removeToken(req.token).then(()=>{
    res.status(200).send({'message':'Admin Logged out Successfully'});
  },()=>{
    res.status(400).send({'message':'Admin Logged out Successfully'});
  });
});

app.post('/login',(req,res)=>{
  var body = _.pick(req.body,['email','password']);

  User.findByCredentials(body.email,body.password).then((user)=>{
    return user.generateAuthToken();
  })
  .then((token)=>{
    req.session.auth = token;
    req.session.auth.maxAge = 36000000;
    console.log('token saved : '+token);
    res.header('x-auth',token).status(200).send(token);
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.delete('/logout',authenticate,(req,res)=>{
  req.user.removeToken(req.token).then(()=>{
    req.session.destroy();
    res.status(200).send();
  },()=>{
    res.status(400).send();
  });
});

app.get('/users/me',authenticate,(req,res)=>{
  res.render('dashboard.html',{
      'name':req.user.name,
      'email':req.user.email,
      'pageTitle':'Dashboard'
  });
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
