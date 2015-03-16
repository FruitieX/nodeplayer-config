var _ = require('underscore');
var mkdirp = require('mkdirp');
var fs = require('fs');

var defaultConfig = {};

var getConfigDir = function() {
	if (process.platform == 'win32')
		return process.env.USERPROFILE + '\\nodeplayer\\';
	else
		return process.env.HOME + '/.nodeplayer/';
};

// Default nodeplayer config
//
// These variables can be overridden by writing the variables you
// wish to override into ~/.nodeplayer-config.json:
//
// {
//     configVariable1: "value",
//     configVariable2: 42,
//     ...
// }

// backends are sources of music
defaultConfig.backends = ['youtube', 'gmusic'];

// plugins are "everything else", most of the functionality is in plugins
//
// NOTE: ordering is important here, plugins that depend on other plugins will
// complain if order is wrong
defaultConfig.plugins = [
    'storeQueue',
    'express',
    'rest',
    'ipfilter',
    'socketio',
    'weblistener',
    'httpAuth',
    'verifyMac',
    'partyplay'
];

defaultConfig.logLevel = 'info';
defaultConfig.logColorize = true;
defaultConfig.logExceptions = false; // disabled for now because it looks terrible
defaultConfig.logJson = false;

defaultConfig.hostname = 'mydomain.com';
defaultConfig.port = 8080;

// TLS options
// By default we use the same TLS key/cert as CA, and on clients/server. We use
// TLS client authentication for restricting access to authorized clients.
// You may want to disable it if you want public access to parts of your server.
defaultConfig.tls = true;
defaultConfig.tlsKey = process.env.HOME + '/.nodeplayer/nodeplayer-key.pem';
defaultConfig.tlsCert = process.env.HOME + '/.nodeplayer/nodeplayer-cert.pem';
defaultConfig.tlsCa = process.env.HOME + '/.nodeplayer/nodeplayer-cert.pem';
defaultConfig.requestCert = true; // TLS client authentication
defaultConfig.rejectUnauthorized = true; // Disabling leaves you vulnerable to MITM

defaultConfig.socketio = {
    queueLimit: 30
};

defaultConfig.verifyMac = {};
defaultConfig.verifyMac.algorithm = 'sha256';
defaultConfig.verifyMac.key = process.env.HOME + '/.nodeplayer/nodeplayer-key.pem';
defaultConfig.verifyMac.iterations = 1000;
defaultConfig.verifyMac.keyLen = 256;

defaultConfig.songCachePath = process.env.HOME + '/.nodeplayer/song-cache';
defaultConfig.searchResultCnt = 10;
defaultConfig.badVotePercent = 0.51;
defaultConfig.songDelayMs = 1000; // add delay between songs to prevent skips
defaultConfig.songMaxDuration = 8 * 60 * 1000; // max allowed song duration
defaultConfig.log = true;

// IP filter for listener
defaultConfig.filterStreamIPs = ['10.8.0.0/24', '127.0.0.1'];
// is the above a blacklist (deny) or whitelist (allow)?
defaultConfig.filterAction = 'allow';

// HTTP basic authentication for music streaming
defaultConfig.username = "testuser";
defaultConfig.password = "keyboard cat";

module.exports = function() {
    var path = getConfigDir() + 'nodeplayer-config.json';
    try {
        var userConfig = require(path);
        var config = _.defaults(userConfig, defaultConfig);
        config.getConfigDir = getConfigDir;
        return config;
    } catch(e) {
        if(e.code === 'MODULE_NOT_FOUND') {
            console.warn('WARNING: Couldn\'t find user configuration file.');
            console.warn('Creating sample configuration file containing default settings into:');
            console.warn(path);

            mkdirp(getConfigDir());
            fs.writeFileSync(path, JSON.stringify(defaultConfig, undefined, 4));

            console.warn('\nFile created. Go edit it NOW! Relaunch nodeplayer when done configuring.');
            console.warn('Note that the file only needs to contain the configuration variables that');
            console.warn('you want to override from the defaults. Also note that it MUST be valid JSON!');
            process.exit(0);
        } else {
            console.warn('unexpected error while loading nodeplayer configuration');
            console.warn(e);
        }
    }
};
