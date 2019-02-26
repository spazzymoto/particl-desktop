const log           = require('electron-log');
const _options    = require('../options').get();
const market    = require('particl-marketplace');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;

// Stores the child process
let child = undefined;

exports.init = function() {
  rxIpc.registerListener('start-market', function() {
    return Observable.create(observer => {
      exports.start();
      observer.complete(true);
    });
  });
  
  rxIpc.registerListener('stop-market', function() {
    return Observable.create(observer => {
      exports.stop();
      observer.complete(true);
    });
  });
}

exports.start = function() {
  if (!_options.skipmarket && !child) {
    log.info('market process starting.');
    child = market.start({
      ELECTRON_VERSION: process.versions.electron,
    });

    child.on('close', code => {
      log.info('market process ended.');
    });

    child.stdout.on('data', data => console.log(data.toString('utf8')));
    child.stderr.on('data', data => console.log(data.toString('utf8')));
  }
}

exports.stop = function() {
  if (!_options.skipmarket && child) {
    log.info('market process stopping.');
    market.stop();
    child = null;
  }
}

// TODO: Export startup function..