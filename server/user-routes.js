const express = require('express');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const { authenticate, isLoggedIn } = require('./../middleware/authenticate');
const { User } = require('./../models/user');
const { Admin } = require('./../models/admin');
const { Terms } = require('./../models/terms');
const { Training } = require('./../models/training');
const { Review } = require('./../models/reviews');
const { Question } = require('./../models/question');
const { Answer } = require('./../models/answer');
const { Comment } = require('./../models/comment');
const { TermComments } = require('./../models/comment');
const { Package } = require('./../models/package');
const { Blog } = require('./../models/blog');

const user_routes = express.Router();


user_routes.get('/', isLoggedIn,async (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)
  var data = {};
  data.trainings = await Training.find({status:true}).limit(4);
  data.blogs = await Blog.find({featured:true}).limit(3);
  data.reviews = await Review.find({status:true}).limit(3);

  res.render("home.html", {
    'pageTitle': 'Welcome to Fitness Marshal',
    'link': 'home',
    'data': data,
    'login': req.loggedIn
  });
});


user_routes.get('/forgot-password', isLoggedIn, (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)
  res.render("forgot-password.html", {
    'pageTitle': 'Verify your email address',
    'link': 'forgot',
    'login': req.loggedIn
  });
});

user_routes.get('/blog', isLoggedIn, (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)
  res.render("blog.html", {
    'pageTitle': 'Welcome to Fitness Marshal',
    'link': 'blog',
    'login': req.loggedIn
  });
});

user_routes.get('/blogs', isLoggedIn, async (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn);

  var data = {};
  data.blogs = await Blog.find({},[],{sort:{'created_on':-1}});

  res.render("blogs.html", {
    'pageTitle': 'Welcome to Fitness Marshal',
    'link': 'blog',
    'data':data,
    'login': req.loggedIn
  });
});

user_routes.get('/blogs/:permalink', isLoggedIn, async (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn);

  var data = {};
  data.relatedBlogs = await Blog.find({featured:true}).limit(3);
  data.mainBlog = await Blog.findOne({permalink:req.params.permalink});
  data.comments = await Comment.find({blog:data.mainBlog._id});
  data.commentsCount = data.comments.length;
  data.tagsArray = data.mainBlog.tags.split('|');

  for(var i = 0; i < data.comments.length ; i++)
  {
    data.comments[i].commentor = await User.findOne({'_id':data.comments[i].author},['name','profile_pic']); 
  }
  console.log("Author",data.tagsArray);

  res.render("blog.html", {
    'pageTitle': data.mainBlog.title,
    'link': 'blog',
    'data':data,
    'login': req.loggedIn
  });
});

user_routes.get('/trainings', isLoggedIn,async (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn);
  var data = {};
  data.trainings = await Training.find({status:true});

  res.render("trainings.html", {
    'pageTitle': 'Choose your training',
    'link': 'trainings',
    'data': data,
    'login': req.loggedIn
  });
});

user_routes.get('/my-training', isLoggedIn, (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)
  res.render("my-training.html", {
    'pageTitle': 'My Training',
    'link': 'my-training',
    'login': req.loggedIn
  });
});

user_routes.get('/my-training/:id', isLoggedIn, (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)
  res.render("training-detail.html", {
    'pageTitle': 'Training Progress',
    'link': 'my-training',
    'login': req.loggedIn
  });
});

user_routes.get('/forum', isLoggedIn, async (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)

  var data = {};
  data.questions = await Question.find({'type':'public'},[],{sort:{'created_on':-1}});

  for(var i=0;i<data.questions.length;i++)
  {
    data.questions[i].ansCount = await Answer.find({'question':data.questions[i].id}).count();
    data.questions[i].asker = await User.findOne({'_id':data.questions[i].author},['name','profile_pic']);
  }

  res.render("forum.html", {
    'pageTitle': 'Forum - Fitness Marshal',
    'link': 'forum',
    'data':data,
    'login': req.loggedIn
  });
});


user_routes.get('/forum/:permalink', isLoggedIn, async (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)

  var data = {};

  data.question = await Question.findOne({'permalink':req.params.permalink});
  data.question.asker =  await User.findOne({'_id':data.question.author},['name','profile_pic']);
  data.question.ansCount = await Answer.find({'question':data.question.id}).count();
  data.answers = await Answer.find({'question':data.question._id});

  for(var i=0;i<data.answers.length;i++)
  {
    data.answers[i].answerer = await User.findOne({'_id':data.answers[i].author},['name','profile_pic','is_trainer']);
    console.log("Author",data.answers[i].answerer);
  }

  res.render("forum-detail.html", {
    'pageTitle': 'Welcome to Fitness Marshal',
    'link': 'forum',
    'data':data,
    'login': req.loggedIn
  });
});

user_routes.get('/contact', isLoggedIn, (req, res) => {
  console.log("LOGGED IN ", req.isLoggedIn)
  res.render("contact.html", {
    'pageTitle': 'Welcome to Fitness Marshal',
    'link': 'contact',
    'login': req.loggedIn
  });
});

user_routes.get('/signup', isLoggedIn, (req, res) => {
  if (req.loggedIn) {
    res.redirect('/');
  }
  else {
    res.render("signin.html", {
      'pageTitle': 'Register - Fitness Marshal',
      'link': 'signup'
    });
  }
});

user_routes.get('/signin', isLoggedIn, (req, res) => {
  if (req.loggedIn) {
    res.redirect('/');
  }
  else {
    res.render("login.html", {
      'pageTitle': 'Login - Fitness Marshal',
      'link': 'signin'
    });
  }
});

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: "sarfraaz.capermint@gmail.com",
    pass: "Sarfraaz@65987"
  }
});

user_routes.post('/signin', (req, res) => {
  console.log(req.body);
  var body = _.pick(req.body, ['name', 'email', 'password']);

  body.created_at = new Date().getTime();

  var user = new User(body);

  user.save().then(() => {
    return user.generateOTP();
  })
    .then((token) => {
      req.session.auth = token;
      req.session.auth.maxAge = 36000000;
      res.send({ 'status': 1, 'token': token });
    })
    .catch((err) => {
      if (err.errors) {
        if (err.errors.name)
          return res.send({ "status": 0, "error": "Please enter the name", 'code': '0005' });
        if (err.errors.email)
          return res.send({ "status": 0, "error": "Please enter a valid email address", 'code': '0006' });
        if (err.errors.password)
          return res.send({ "status": 0, "error": "Password must be at least 6 characters long", 'code': '0007' });
        if (err.errors.platform)
          return res.send({ "status": 0, "error": "Please provide the platform name", 'code': '0007' });
      }
      if (err.code) {
        return res.send({ "status": 0, "error": "Sorry, email you entered is already in use. Please try with another email.", 'code': '0008' });
      }
      console.log(err);
      res.send({ "status": 0, 'error': "Some error occurred", 'code': '0009' });
    });
});


user_routes.post('/verify_otp', (req, res) => {
  var body = _.pick(req.body, ['otp', 'token']);

  User.verifyOtp(body.otp, body.token).then((user) => {
    console.log("Pass 1");
    return user.generateAuthToken();
  })
    .then((token) => {
      console.log("Pass 2");
      req.session.auth = token;
      req.session.auth.maxAge = 36000000;
      res.send();
    })
    .catch((err) => {
      console.log(err);
      res.send({ 'error': err, 'code': '0010' });
    });
});


user_routes.post('/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken();
  })
    .then((token) => {
      req.session.auth = token;
      req.session.auth.maxAge = 36000000;
      console.log('token saved : ' + token);
      res.header('x-auth', token).send({ "status": 1, "token": token });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});


user_routes.delete('/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    req.session.destroy();
    res.send();
  }, () => {
    res.send({ 'error': 'User is not logged in!', 'code': '0016' });
  });
});

user_routes.post('/users/me', authenticate, (req, res) => {
  res.send({
    'name': req.user.name,
    'email': req.user.email
  });
});

// user_routes.get('/forgot_password',(req,res)=>{
//   res.render('forgot_password.html',{
//     'pageTitle':'Forgot Password?'
//   });
// });

user_routes.post('/reset_password', (req, res) => {
  var body = _.pick(req.body, ['email']);

  User.findOne(body).then((user) => {
    if (!user)
      return Promise.reject('This email address does not belong to any account on this server!');
    return user.generateResetToken();
  })
    .then((data) => {

      let mailOptions = {
        from: '"Capermint " <sarfraaz-capermint@gmail.com>', // sender address
        to: data.email, // list of receivers
        subject: 'Reset your Password', // Subject line
        text: 'Hey there, reset your password using this link http://localhost:3000/reset_password/' + data.token, // plain text body
        html: 'Hey there, reset your password using this <a href="http://localhost:3000/reset_password/' + data.token + '"> link</a>' // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        console.log(error);
        if (error) {
          // return res.send({'error':"Error sending email to the address you provided, please check your email & try again!",'code':'0017'});
          return res.send({ 'error': error, 'code': '0017' });
        }
        res.send({ "message": "Password reset link sent to the registered email, successfully" });
      });
    })
    .catch((err) => {
      res.send({ 'error': err, 'code': '0017' });
    });
});


user_routes.get('/reset_password/:token', (req, res) => {
  User.validateResetToken(req.params.token).then((user) => {
    res.render('reset_password.html', {
      'token': req.params.token
    });
  })
    .catch((err) => {
      res.send({ 'error': "Bad request, Either the link has been altered or expired!", 'code': '0018' });
    });
});

user_routes.patch('/change_password_after_reset/', (req, res) => {
  var body = _.pick(req.body, ['password', 'token']);
  User.resetByToken(body.password, body.token).then((user) => {
    res.send({ 'message': "Password changed successfully" });
  })
    .catch((err) => {
      res.send({ 'error': "Bad request, Either the link has been altered or expired!", 'code': '0019' });
    });
});

module.exports = user_routes;
