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
  assert(options.target, 'must have target')
  startWithConfig(options, cb);
};

const startWithConfig = function getConfigStart(options, cb) {
  if (options.config) {
    startServer(options.keys, options.pluginDir, options.config, cb);
  }
  else {
    fs.exists(options.target, (exists) => {
      if (exists) {
        const config = edgeConfig.load({source: options.target});
        startServer(options.keys, options.pluginDir, config, cb);
      } else {
        return cb(options.target + " must exist")
      }
    });
  }
};

const startServer = function startServer(keys, pluginDir,config, cb) {
  agent.start(keys, pluginDir, config, function (err) {
    cb(err, agent, config);
  });
}