'use strict';
const edgeConfig = require('microgateway-config');
const agent = require('./server')();
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cluster = require('cluster');
const util = require('util');

/**
 * starts an configures agent
 * @param env {source,target,keys{key,secret}}
 * @param cb
 */
module.exports = function configureAndStart(options, cb) {
  assert(options.target, 'must have target');
  getConfigStart(options, cb);
};

const getConfigStart = function getConfigStart(options, cb) {

  if (options.heapDump) {
    var memwatch = require('memwatch-next');
    var heapdump = require('heapdump');
    var hd;
    var counter = 0;
    setInterval(function inspectHeap() {
      console.error('Heap snapshot in process ' + process.pid);
      //write heapdump snapshot.  This can be analyzed in Chome Dev Tools
      heapdump.writeSnapshot('/tmp/' + process.pid + '-' + counter + '.heapsnapshot');

      // Generate a heap diff
      if (!hd) {
        hd = new memwatch.HeapDiff();
      } else {
        var diff = hd.end();
        fs.writeFileSync('/tmp/' + process.pid + '-' + counter + '.heapDiff', util.inspect(diff, true, null));
        hd = null;
      }
      counter++;
    }, 30000);
  }

  fs.exists(options.target, (exists) => {
    if (exists) {
      const config = edgeConfig.load({ source: options.target });
      startServer(options.keys, options.pluginDir,config, cb);
    } else {
      return cb(options.target+" must exist")
    }
  });
};

const startServer = function startServer(keys, pluginDir,config, cb) {

  agent.start(keys, pluginDir, config, function (err) {
    cb(err, agent, config);
  });
}