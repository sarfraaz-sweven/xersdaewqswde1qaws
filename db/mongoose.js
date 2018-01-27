const mongoose = require('mongoose');

mongoose.connect("mongodb://marshal:fitness#53@ds117148.mlab.com:17148/fitness-marshal",{useMongoClient:true});
mongoose.Promise = global.Promise;
