var env = process.env || 'development';

  var config  = require('./config.json');
  var envConfig = config['development'];

  Object.keys(envConfig).foreach((key) => {
    console.log(key);
    process.env[key]=  envConfig[env];
  })
