const mongoose = require('mongoose');

mongoose.connect("mongodb://admin:admin@ds249605.mlab.com:49605/realfaces",{useMongoClient:true});
mongoose.Promise = global.Promise;
