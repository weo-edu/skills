var Waterline = require('waterline')
  , httpAdapter = require('sails-adapter-http')
  , config = require('lib/config')
  , clientModels = require('clientModels')
  , _ = require('underscore')
  , ClientModel = Waterline.Collection.extend({
    adapter: 'http'
  });

httpAdapter.host = config.apiServer;
httpAdapter.port = config.apiPort;

module.exports = {};
_.each(clientModels, function(model, key) {
  model.adapter = 'http';
  model.identity = model.identity || key;
  model.tableName = model.tableName || key;
  model = ClientModel.extend(model);
  module.exports[key] = new model({
      adapters: {
        http: require('sails-adapter-http')
      }
    }, function(err) {
    if(err) throw err;
  });
});