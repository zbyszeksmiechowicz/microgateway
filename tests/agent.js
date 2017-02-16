'use strict';
const assert = require('assert');
const request = require('request');
const url = require('url');
const os = require('os');
const agent = require('../lib/server')();
const edgeConfig = require('microgateway-config');
const restServer = require('./server/hello/hello.js')();
const path = require('path');
const configure = require('../cli/lib/configure')();
const token = require('../cli/lib/token')();
const envVars = require('./env');

const configLocations = require('../config/locations');
const thisPath = path.normalize(__dirname);
configLocations.homeDir = thisPath;
configLocations.defaultDir = thisPath;
// const password = envVars.password;
// const key = envVars.key;
// const secret = envVars.secret;
// const user = envVars.user;
// const org = envVars.org;
// const env = envVars.env;
describe('configured agent/server address', function() {
  const port = 3303;
  const apidPort = 3304;
  var target;
  var apidServer;
  restServer.listen(port)


  
  var config;
  before(function(done) {
    this.timeout(400000);
    var http = require('http');
    function handleRequest(request, response){        
      response.end(JSON.stringify(require('./sample_deployments_response.js')));
    }
    apidServer = http.createServer(handleRequest);
    apidServer.listen(apidPort, function(){
      console.log("Test apid server listening on: http://localhost:%s", apidPort);
    });

    edgeConfig.get({systemConfigPath: './systemConfig.yaml',  apidEndpoint: 'http://localhost:'+apidPort }, (err, configDownload) => {
      config = configDownload;
      config.proxies[0].url = "http://localhost:" + port + "/";
      target = "http://localhost:" + config.system.port + "/iloveapis/";
      agent.start(null, config, done);
    });
  });

  after(function(done) {
    // close agent server before finishing
    restServer.close(()=>{
      agent.close(done);
    });
    apidServer.close();
  });

  beforeEach(function(done) {
    done();
  });

  it('hit server', function(done) {
    request({
      method: 'GET',
      uri: target
    }, function(err, res, body) {
      assert(!err, err);
      assert.equal(res.statusCode, 200);
      done(err);
    });
  });


  it('fails to hit server', function(done) {
    agent.close();
    request({
      method: 'GET',
      uri: target
    }, function(err, res, body) {
      assert(err, 'must have err');
      assert.equal(err.code, "ECONNREFUSED");
      agent.start(null, config, done);
    });
  });

  it('fails to hit server, then starts', function(done) {
    this.timeout(5000000);
    agent.close();
    request({
      method: 'GET',
      uri: target
    }, function(err, res, body) {
      assert(err, 'must have err');
      assert.equal(err.code, "ECONNREFUSED");
      agent.start(null, config, () => {
        request({
          method: 'GET',
          uri: target
        }, function(err, res, body) {
          assert(!err, err);
          assert.equal(res.statusCode, 200);
          done(err);
        });
      });
    });
  });
});
