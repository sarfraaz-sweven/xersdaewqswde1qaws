const mongoose = require('mongoose');

mongoose.connect("mongodb://sarfraaz:sarfraaz@ds235065.mlab.com:35065/nodetest",{useMongoClient:true});
mongoose.Promise = global.Promise;
