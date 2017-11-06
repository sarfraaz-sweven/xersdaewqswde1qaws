const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const session = require('express-session');

var {mongoose} = require('./../db/mongoose');
var {User} = require('./../models/user');
var {Admin} = require('./../models/admin');

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

app.listen(port,(err)=>{
  console.log(`Started server on port : ${port}`);
});
