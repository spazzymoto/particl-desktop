const log = require('electron-log');
const { session } = require('electron')
const { URL } = require('url')

const _options = require('../options');
const cookie = require('../rpc/cookie');

const OPTIONS = _options.get();

// Modify the user agent for all requests to the following urls.
const filter = {
    urls: ['*']
}

let whitelist = new Map();

exports.init = function () {
    loadDev();
    loadMarketAuthentication();
    loadWalletAuthentication();
    loadGithub();

    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        // clone it
        const url = new URL(details.url);
        const u = url.hostname + ":" + (url.port || 80);

        if (isWhitelisted(u)) {
            let headers = Object.assign({}, details.requestHeaders);

            // get authentication
            let auth = getAuthentication(u);

            if(auth !== undefined) {
                if (auth === false) {
                    // no authentication required

                    callback({ cancel: false, requestHeaders: headers });
                } else {
                    // inject authentication into headers
                    headers['Authorization'] = 'Basic ' + new Buffer(auth).toString('base64')
                    callback({ cancel: false, requestHeaders: headers })
                }
            } else {
                log.error('No authentication retrieved!');
                callback({ cancel: true });
            }

        } else {
            log.error('Not whitelisted: ' + u);
            callback({ cancel: true });
        }
    })

}

function isWhitelisted(url) {
    return whitelist.has(url);
}

// Get the right authentication for the right hostname
// e.g market vs rpc
function getAuthentication(url) {
  let entry = whitelist.get(url);
  if (isPlainObject(entry) && 'auth' in entry ) {
    if (entry.name === 'wallet' && !entry.auth) {
      // cookie might not be grabbed just yet, so try again..
      loadWalletAuthentication();
      // entry = whitelist.get(url);
    }
    return entry.auth;
  }
}

function loadMarketAuthentication() {
    // let key = "dev1.particl.xyz:";
    let key = "localhost:3000";
    let value = {
        name: "market",
        auth: "test:test"
    }

    whitelist.set(key, value);
}

function loadWalletAuthentication() {
    let key = (OPTIONS.rpcbind || 'localhost') + ":" + OPTIONS.port;
    console.log('adding key=' + key);
    let value = {
        name: "wallet",
        auth: cookie.getAuth(OPTIONS)
    }

    whitelist.set(key, value);
}

// when restarting, delete authentication
exports.removeWalletAuthentication = () => {
    let key = (OPTIONS.rpcbind || 'localhost') + ":" + OPTIONS.port;
    whitelist.get(key).auth = undefined;
}

function loadDev() {
  if (OPTIONS.dev === true) {
    let key = 'localhost:4200';
    let value = {
        name: "dev",
        auth: false
    }

    whitelist.set(key, value);
  }
}

function loadGithub() {
    let key = "api.github.com:80";
    let value = {
        name: "github update service",
        auth: false
    }

    whitelist.set(key, value);
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
