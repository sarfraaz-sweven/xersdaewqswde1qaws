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
hbs.registerHelper( "verify", function (v){
  return v ? "Verified" : "Not Verified";
});
hbs.registerHelper( "status", function (s){
  return s ? "Active" : "Not Active";
});
hbs.registerHelper( "action_button", function (s){
  return s ? new hbs.SafeString("<button data-id='"+this._id+"'  type='button' class='btn btn-block btn-primary deactivate'>Deactivate</button>") :  new hbs.SafeString("<button data-id='"+this._id+"'  type='button' class='btn btn-block btn-primary activate'>Activate</button>");
});
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
  var body = _.pick(req.body,['name','email','password']);
  var user = new User(body);

  console.log('hi ',body);
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

  User.verifyOtp(body.otp,body.token).then((user)=>{
    console.log("Pass 1");
    return user.generateAuthToken();
  })
  .then((token)=>{
    console.log("Pass 2");
    req.session.auth = token;
    req.session.auth.maxAge = 36000000;
    res.status(200).send();
  })
  .catch((err)=>{
    console.log(err);
    res.status(400).send({'error':err});
  });
});

app.get('/admin/signin',(req,res)=>{
  res.render('admin/signin.html',{
    'pageTitle':'Admin Signin'
  });
});

app.post('/admin/signin',(req,res)=>{
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
    res.status(400).send(err);
  });
});

app.get('/admin/login',(req,res)=>{
  res.render('admin/login.html',{
    'pageTitle':'Admin Login'
  });
});

app.post('/admin/login',(req,res)=>{
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
    res.status(400).send(err);
  });
});

app.get('/admin',authenticateAdmin,(req,res)=>{
  res.render('admin/dashboard.html',{
    'pageTitle':'Admin Dashboard',
    'name':req.admin.name
  });
});

app.get('/admin/users',authenticateAdmin,(req,res)=>{
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
    res.status(401).send(err);
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

app.get('/forgot_password',(req,res)=>{
  res.render('forgot_password.html',{
    'pageTitle':'Forgot Password?'
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
      res.send('reset_password/'+token);
  })
  .catch((err)=>{
    res.status(400).send(err);
  });
});

app.get('/reset_password/:token',(req,res)=>{
  User.validateResetToken(req.params.token).then((user)=>{
//    res.status(200).send({'name':user.name,'token':req.params.token});
      res.render('reset_password.html',{
        'token':req.params.token
      });
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
