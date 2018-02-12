const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const session = require('express-session');
const ta = require('time-ago')

const {mongoose} = require('./../db/mongoose');
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
const { Session } = require('./../models/sessions');
const { Blog } = require('./../models/blog');

// var term = new Session({
//   package:"5a80737589f881232c830884",
//   set_on:"1520238600",
//   status:false
// });

// term.save().then((doc)=>{
//   console.log(doc);
// })
// .then((err)=>{
//   console.log(err);
// });

var app = express();
const port = process.env.PORT || 3000;

hbs.registerPartials(__dirname+'./../views');
hbs.registerHelper( "verify", function (v){
  return v ? "Verified" : "Not Verified";
});
hbs.registerHelper( "status", function (s){
  return s ? "Active" : "Not Active";
});
hbs.registerHelper( "action_button", function (s){
  return s ? new hbs.SafeString("<button data-id='"+this._id+"'  type='button' class='btn btn-block btn-primary deactivate'>Deactivate</button>") :  new hbs.SafeString("<button data-id='"+this._id+"'  type='button' class='btn btn-block btn-primary activate'>Activate</button>");
});
hbs.registerHelper( "ternary", function (p1,p2,a,z){
  var arr = p2.split('|');

  for(var i of arr)
  {
    if(i == p1)
      return a;
      
  }
  return z;
});
hbs.registerHelper( "evenOdd", function (p1,p2,p3){
  if(p1%2 !== 0)
    return p2;
  else
    return p3;
});
hbs.registerHelper( "timeAgo", function (p1){
  return ta.ago(p1*1000);
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

app.use(express.static(__dirname + './../public'));

app.use(require('./user-routes'));
app.use(require('./admin-routes'));
app.use(require('./api-routes'));


app.listen(port,(err)=>{
  console.log(`Started server on port : ${port}`);
});
