'use strict'
const gateway = require('microgateway-core');
const plugins = require('./plugins');

/**
 * returns an instance of the gateway with plugins loaded
 * @param config
 */
module.exports = function init(pluginDir,config) {
  preprocessConfig(config);
  const gatewayInstance = gateway(config)
  plugins(gatewayInstance,pluginDir).loadPlugins(config)
  return gatewayInstance
}

function preprocessConfig(config) {

  if (config.edgemicro.proxies) {
    //iterate over proxies in edgemicro stanza.  Throw in the proxy level config into the top level proxy objects
    config.edgemicro.proxies.forEach(function (proxy) {
      var proxyName = Object.keys(proxy)[0];
      if (proxy[proxyName] && proxy[proxyName]["plugins"]) {
        var foundProxy = config.proxies.find(function (proxy) {
          return proxy.name == proxyName;
        });
        foundProxy.plugins = proxy[proxyName]["plugins"];
      }
    })
  }
}
