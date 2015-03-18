var _ = require('underscore');
var mkdirp = require('mkdirp');
var fs = require('fs');
var os = require('os');

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

var defaultConfig = {};

// backends are sources of music, default backends don't require API keys
defaultConfig.backends = [
    'file'
];

// plugins are "everything else", most of the functionality is in plugins
//
// NOTE: ordering is important here, plugins that require another plugin will
// complain if order is wrong.
defaultConfig.plugins = [
    'storeQueue',
    'express',
    'rest',
    'socketio',
    'weblistener',
    'httpAuth'
];

defaultConfig.logLevel = 'info';
defaultConfig.logColorize = true;
defaultConfig.logExceptions = false; // disabled for now because it looks terrible
defaultConfig.logJson = false;

defaultConfig.playedQueueSize = 100;

// hostname of the server, may be used as a default value by other plugins
defaultConfig.hostname = os.hostname();

function getConfigDir() {
	if (process.platform == 'win32')
		return process.env.USERPROFILE + '\\nodeplayer\\config\\';
	else
		return process.env.HOME + '/.nodeplayer/config/';
};
exports.getConfigDir = getConfigDir;

exports.getDefaultConfig = function() {
    return defaultConfig;
};

// path and defaults are optional, if undefined then values corresponding to core config are used
exports.getConfig = function(moduleName, defaults) {
    if (process.env.NODE_ENV === 'test') {
        // unit tests should always use default config
        return defaults || defaultConfig;
    }

    var path = getConfigDir() + (moduleName || 'core') + '.json'));

    try {
        var userConfig = require(path);
        var config = _.defaults(userConfig, defaults || defaultConfig);
        return config;
    } catch(e) {
        if(e.code === 'MODULE_NOT_FOUND') {
            if (!moduleName) {
                // only print welcome text for core module first run
                console.warn('Welcome to nodeplayer!');
                console.warn('----------------------');
            }
            console.warn('We couldn\'t find the user configuration file for module "' + (moduleName || 'core') + '",');
            console.warn('so a sample configuration file containing default settings will be written into:');
            console.warn(path);

            mkdirp(getConfigDir());
            fs.writeFileSync(path, JSON.stringify(defaultConfig, undefined, 4));

            console.warn('\nFile created. Go edit it NOW! Relaunch nodeplayer when done configuring.');
            console.warn('Note that the file only needs to contain the configuration variables that');
            console.warn('you want to override from the defaults. Also note that it MUST be valid JSON!');
            process.exit(0);
        } else {
            console.warn('Unexpected error while loading configuration for module "' + (moduleName || 'core') + '":');
            console.warn(e);
        }
    }
};
