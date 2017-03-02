const edgeconfig = require('microgateway-config');

module.exports = function(options, cb) {
  edgeconfig.get({
    systemConfigPath: options.systemConfigPath, 
    apidEndpoint: options.apidEndpoint, 
    printRawConfig: options.printRawConfig
  },  (err, config) => {
    if (err) {
      if(err.name == 'YAMLException') {
        err.message = err.name + ' ' + err.reason;
      }
      console.log('Error downloading configuration. Gateway not started. Reason: ', err.message);
      return cb(err);
    } else {
      return cb(null, config);
    }

  });
}