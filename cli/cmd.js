'use strict';

const commander = require('commander');
const run = require('./lib/gateway')();


const setup = function setup() {
  commander
    .version(require('../package.json').version);
  


  commander
    .command('start')
    .option('-p, --processes <processes>', 'number of processes to start, defaults to # of cores')
    .option('-d, --pluginDir <pluginDir>','absolute path to plugin directory')
    .option('-r, --port <portNumber>','override port in the config.yaml file')
    .option('-s, --systemConfigPath <systemConfigPath>', 'Path where the system config is located')
    .option('-a, --apidEndpoint <apidEndpoint>', 'Base url for your apid instance')

    .description('start the gateway based on configuration')
    .action((options)=>{
      options.error = optionError;
      options.processes =  options.processes || process.env.EDGEMICRO_PROCESSES;
      options.systemConfigPath = options.systemConfigPath || process.env.EDGEMICRO_SYSTEM_CONFIG_PATH;
      options.apidEndpoint = options.apidEndpoint || process.env.EDGEMICRO_APID_ENDPOINT;

      run.start(options);
    });

  commander.parse(process.argv);


  var running = false;
  commander.commands.forEach(function(command) {
    if (command._name == commander.rawArgs[2]) {
      running = true;
    }
  });
  if (!running) {
    commander.help();
  }
};

function optionError(message) {
  console.error(message);
  this.help();
}

module.exports = setup;
