const express = require('express');
const _ = require('lodash');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const {authenticate} = require('./../middleware/authenticate');
const {User} = require('./../models/user');

const user_routes = express.Router();

// user_routes.get('/',(req,res)=>{
//   res.render("home.html",{
//     'pageTitle':'Welcome to Home'
//   });
// });

// user_routes.get('/signin',(req,res)=>{
//   res.render("signin.html",{
//     'pageTitle':'Welcome to Home'
//   });
// });

// user_routes.get('/login',(req,res)=>{
//   res.render("login.html",{
//     'pageTitle':'Welcome to Home'
//   });
// });

let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
          user: "sarfraaz.capermint@gmail.com",
          pass: "Sarfraaz@65987"
      }
  });

user_routes.post('/signin',(req,res)=>{
  console.log(req.body);
  res.send(req.body);
  // var body = _.pick(req.body,['name','email','mobile_no','password','type_login','device_id','platform','profile_pic','social_id']);
  //
  // body.created_at = new Date().getTime();
  //
  // var user = new User(body);
  //
  // user.save().then(()=>{
  //   return user.generateAuthToken();
  // })
  // .then((token)=>{
  //   // req.session.auth = token;
  //   // req.session.auth.maxAge = 36000000;
  //   res.status(200).send(token);
  // })
  // .catch((err)=>{
  //   if(err.errors)
  //   {
  //     if(err.errors.name)
  //       return res.status(400).send({"error":"Please enter the name",'code':'0005'});
  //       if(err.errors.email)
  //         return res.status(400).send({"error":"Please enter a valid email address",'code':'0006'});
  //         if(err.errors.mobile_no)
  //           return res.status(400).send({"error":"Please enter a 10 digit mobile number",'code':'0007'});
  //           if(err.errors.password)
  //             return res.status(400).send({"error":"Password must be at least 6 characters long",'code':'0007'});
  //             if(err.errors.device_id)
  //               return res.status(400).send({"error":"Please provide device id",'code':'0007'});
  //               if(err.errors.platform)
  //                 return res.status(400).send({"error":"Please provide the platform name",'code':'0007'});
  //   }
  //   if(err.code)
  //   {
  //     return res.status(400).send({"error":"Sorry, email you entered is already in use. Please try with another email.",'code':'0008'});
  //   }
  //   res.status(400).send({'err':err,'code':'0009'});
  // });
});

// user_routes.post('/verify_otp',(req,res)=>{
//   var body = _.pick(req.body,['otp','token']);
//
//   User.verifyOtp(body.otp,body.token).then((user)=>{
//     console.log("Pass 1");
//     return user.generateAuthToken();
//   })
//   .then((token)=>{
//     console.log("Pass 2");
//     req.session.auth = token;
//     req.session.auth.maxAge = 36000000;
//     res.status(200).send();
//   })
//   .catch((err)=>{
//     console.log(err);
//     res.status(400).send({'error':err,'code':'0010'});
//   });
// });

user_routes.post('/login',(req,res)=>{
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
    res.status(400).send({'error':err,'code':'0015'});
  });
});

user_routes.delete('/logout',authenticate,(req,res)=>{
  req.user.removeToken(req.token).then(()=>{
    req.session.destroy();
    res.status(200).send();
  },()=>{
    res.status(400).send({'error':'User is not logged in!','code':'0016'});
  });
});

user_routes.post('/users/me',authenticate,(req,res)=>{
  res.send({
      'name':req.user.name,
      'email':req.user.email
    });
});

// user_routes.get('/forgot_password',(req,res)=>{
//   res.render('forgot_password.html',{
//     'pageTitle':'Forgot Password?'
//   });
// });

user_routes.post('/reset_password',(req,res)=>{
  var body = _.pick(req.body,['email']);

  User.findOne(body).then((user)=>{
      if(!user)
        return Promise.reject('This email address does not belong to any account on this server!');
      return user.generateResetToken();
  })
  .then((data)=>{

    let mailOptions = {
            from: '"Capermint " <sarfraaz-capermint@gmail.com>', // sender address
            to: data.email, // list of receivers
            subject: 'Reset your Password', // Subject line
            text: 'Hey there, reset your password using this link http://localhost:3000/reset_password/'+data.token, // plain text body
            html: 'Hey there, reset your password using this <a href="http://localhost:3000/reset_password/'+data.token+'"> link</a>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          console.log(error);
            if (error) {
              // return res.status(400).send({'error':"Error sending email to the address you provided, please check your email & try again!",'code':'0017'});
              return res.status(400).send({'error':error,'code':'0017'});
            }
            res.send({"message":"Password reset link sent to the registered email, successfully"});
        });
  })
  .catch((err)=>{
    res.status(400).send({'error':err,'code':'0017'});
  });
});

user_routes.get('/reset_password/:token',(req,res)=>{
  User.validateResetToken(req.params.token).then((user)=>{
      res.render('reset_password.html',{
        'token':req.params.token
      });
  })
  .catch((err)=>{
    res.status(400).send({'error':"Bad request, Either the link has been altered or expired!",'code':'0018'});
  });
});

user_routes.patch('/change_password_after_reset/',(req,res)=>{
  var body = _.pick(req.body,['password','token']);
  User.resetByToken(body.password,body.token).then((user)=>{
    res.status(200).send({'message':"Password changed successfully"});
  })
  .catch((err)=>{
    res.status(400).send({'error':"Bad request, Either the link has been altered or expired!",'code':'0019'});
  });
});

module.exports = user_routes;
