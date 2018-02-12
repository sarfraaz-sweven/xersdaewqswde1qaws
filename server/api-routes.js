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

const api_routes = express.Router();

api_routes.post('/api/login', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken();
    })
        .then((token) => {
            req.session.auth = token;
            req.session.auth.maxAge = 36000000;
            console.log('token saved : ' + token);
            res.send({ "status": 1, "token": token });
        })
        .catch((err) => {
            console.log(err);
            res.send({ "status": 0 });
        });
});

api_routes.post('/api/signup', async (req, res) => {
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
            }
            if (err.code) {
                return res.send({ "status": 0, "error": "Sorry, email you entered is already in use. Please try with another email.", 'code': '0008' });
            }
            console.log(err);
            res.send({ "status": 0, 'error': "Some error occurred", 'code': '0009' });
        });
});

api_routes.get('/api/getBlogs', async (req, res) => {
    var blogs = await Blog.find({},[],{sort:{'created_on':-1}});
    res.send({'blogs':blogs});
});

api_routes.get('/api/getTrainings', async (req, res) => {
    var trainings = await Training.find({status:true});
    res.send({'trainings':trainings})
});

api_routes.get('/api/getFeaturedBlogs', async (req, res) => {
    var blogs = await Blog.find({'featured':true},[],{limit:3,sort:{'created_on':-1}});
    res.send({'blogs':blogs});
});

api_routes.get('/api/getFeaturedTrainings', async (req, res) => {
    var trainings = await Training.find({'status':true},[],{limit:4});
    res.send({'trainings':trainings});
});

api_routes.get('/api/getBlogDetail/:id', async (req, res) => {

    var data = {};

    data.blog = await Blog.findOne({_id:req.params.id});
    data.comments = await Comment.find({blog:data.blog._id});
    data.commentsCount = data.comments.length;
    data.tagsArray = data.blog.tags.split('|');
    res.send(data);
});

api_routes.get('/api/getQuestions', async (req, res) => {
    var data = {};
    data.questions = await Question.find({'type':'public'},[],{sort:{'created_on':-1}});

    for(var i=0;i<data.questions.length;i++)
    {
      data.questions[i].ansCount = await Answer.find({'question':data.questions[i].id}).count();
      data.questions[i].asker = await User.findOne({'_id':data.questions[i].author},['name','profile_pic']);
    }

    res.send({'questions':data.questions});
});

api_routes.get('/api/getQuestionDetail/:id', async (req, res) => {
    var data = {};

    data.question = await Question.findOne({'_id':req.params.id});
    data.question.asker =  await User.findOne({'_id':data.question.author},['name','profile_pic']);
    data.question.ansCount = await Answer.find({'question':data.question.id}).count();
    data.answers = await Answer.find({'question':data.question._id});
  
    for(var i=0;i<data.answers.length;i++)
    {
      data.answers[i].answerer = await User.findOne({'_id':data.answers[i].author},['name','profile_pic','is_trainer']);
      console.log("Author",data.answers[i].answerer);
    }

    res.send(data);
  
});

api_routes.get('/api/addComment', async (req, res) => {

});

api_routes.post('/api/addQuestion', async (req, res) => {

});

api_routes.post('/api/addAnswer', async (req, res) => {

});

api_routes.post('/api/getLatestSchedule', async (req, res) => {

});

api_routes.post('/api/getAllPackages', async (req, res) => {

});

api_routes.post('/api/getPackageDetail', async (req, res) => {

});

module.exports = api_routes;
