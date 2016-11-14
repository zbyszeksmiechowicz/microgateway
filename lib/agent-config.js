'use strict';
const edgeConfig = require('microgateway-config');
const agent = require('./server')();
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cluster = require('cluster');

/**
 * starts an configures agent
 * @param env {source,target,keys{key,secret}}
 * @param cb
 */
module.exports = function configureAndStart(options, cb) {
  startWithConfig(options, cb);
};

const startWithConfig = function getConfigStart(options, cb) {
  edgeConfig.get({}, (err, newConfig) => {
    if (err) {
      console.log("Error getting edgemicro configuration.  Will attempt to start with previous configuration, if reloading");
      if (options.config) {
        startServer(options.keys, options.pluginDir, options.config, cb);
      }
    }
    else {
      if (options.port) {
        config.system.port = parseInt(options.port);
      }
      startServer(options.keys, options.pluginDir, newConfig, cb);
    }
  });

  //this should probably be deleted.  doubt it will ever fire;
  /*else {
   console.log("Starting with cached.")
   fs.exists(options.target, (exists) => {
   if (exists) {
   const config = configService.get();
   startServer(options.keys, options.pluginDir, config, cb);
   } else {
   return cb(options.target + " must exist")
   }
   });
  }*/
};

const startServer = function startServer(keys, pluginDir,config, cb) {
  agent.start(keys, pluginDir, config, function (err) {
    cb(err, agent, config);
  });
}