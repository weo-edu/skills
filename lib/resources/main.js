var name = module.exports = require('./package.json').name;

require('angular');
require('angular-resource');

var apiServer = require('lib/config').apiServer
  , clientModels = require('clientModels')
  , anchor = require('anchor')
  , _ = require('underscore');

angular.module(name, ['ngResource'])
.factory('Skill', ['$resource', 
function($resource) {
  return $resource(apiServer + '/skill/:id', null, {
    update: {method: 'PUT'},
    search: {
      method: 'GET', 
      url: apiServer + '/search/skills/:q', 
      isArray: true
    }
  });
}])
.factory('Tag', ['$resource', function($resource) {
  return $resource(apiServer + '/tag/:id', null, {
    update: {method: 'PUT'},
    search: {
      method: 'GET', 
      url: apiServer + '/search/tags/:q', 
      isArray: true
    }
  });
}])
.factory('ValidatorFactory', function() {
  function anchorify(attrs) {
    var validations = {};
    for(var attr in attrs) {
      var validation = validations[attr] = {};
      var attrsVal = attrs[attr];

      if(typeof attrsVal === 'string')
        attrsVal = {type: attrsVal};

      for(var prop in attrsVal) {
        if(/^(defaultsTo|primaryKey|autoIncrement|unique|index|columnName)$/.test(prop)) continue;

        // use the Anchor `in` method for enums
        if(prop === 'enum') {
          validation['in'] = attrsVal[prop];
        }
        else {
          validation[prop] = attrsVal[prop];
        }
      }
    }
    return validations;
  }

  return function(attrs, types) {
    console.log('attrs', _.clone(attrs, true));
    var validations = anchorify(attrs);
    anchor.define(types || {});

    var validators = {};
    _.each(validations, function(curValidation, name) {
      validators[name] = function(value) {
        var requirements = anchor(curValidation);
        // Grab value and set to null if undefined
        if(typeof value == 'undefined') value = null;

        // If value is not required and empty then don't
        // try and validate it
        if(!curValidation.required) {
          if(value === null || value === '') 
            return;
        }

        // If Boolean and required manually check
        if(curValidation.required && curValidation.type === 'boolean') {
          if(value.toString() == 'true' || value.toString() == 'false') 
            return;
        }

        var ctrl = this
          , o = {};
        o[name] = value;
        _.each(requirements.data, function(req, key) {
          ctrl[name].$setValidity(key, true);
          if(typeof req !== 'function') return;
          requirements.data[key] = req.apply(o, []);
        });

        var err = anchor(value).to(requirements.data, o);
        if(err) {
          _.each(err, function(val, key) {
            ctrl[name].$setValidity(val.rule, false);
          });
        }

        return value;
      };
    });
    return validators;
  };
})
.config(['$provide', function($provide) {
  _.each(clientModels, function(model, name) {
    $provide.decorator(name, ['$delegate', 'ValidatorFactory', 
      function($delegate, ValidatorFactory) {
        $delegate.prototype.validators = ValidatorFactory(model.attributes, model.types);
        return $delegate;
    }]);
  });
}])