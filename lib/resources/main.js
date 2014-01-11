var name = module.exports = require('./package.json').name;

require('mang-models');

var apiServer = require('lib/config').apiServer
  , clientModels = require('clientModels'); 

angular.module(name, ['ngResource', 'mangModels'])
.run(['Models', '$resource', function(models, $resource){
  models
    .schemas(clientModels)
    .add('Skill', $resource(apiServer + '/skill/:id', null, {
      update: {method: 'PUT'},
      search: {
        method: 'GET', 
        url: apiServer + '/search/skills/:q', 
        isArray: true
      }
    }))
    .add('Tag', $resource(apiServer + '/tag/:id', null, {
      update: {method: 'PUT'},
      search: {
        method: 'GET', 
        url: apiServer + '/search/tags/:q', 
        isArray: true
      }
  }));
}]);
