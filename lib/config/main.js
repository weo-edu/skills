var _ = require('underscore')
  , config = require('./config.js')
  , modes = ['development', 'production'];

var mode;
if(typeof window !== 'undefined') {
  mode = SETTINGS.env;
} else {
  mode = process.env.NODE_ENV || 'development';
}

_.extend(config, config[mode]);
_.each(modes, function(mode) {
  delete config[mode];
});

module.exports = config;