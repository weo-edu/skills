var name = module.exports = require('./package.json').name;

require('angular');
require('angular-resource');

var apiServer = require('lib/config').apiServer
  , clientModels = require('clientModels')
  , anchor = require('anchor')
  , _ = require('underscore')
  , Emitter = component('emitter');

angular.module(name, ['ngResource'])
.factory('Models', ['ValidatorFactory', function(ValidatorFactory) {
  var resources = {};
  return {
    get: function(name) {
      var Resource = resources[name];
      if (Resource && !Resource.prototype.validators) {
        var schema = clientModels[name];
        Resource.prototype.validators = ValidatorFactory(schema.attributes, schema.type);
      }
      return Resource;
    },
    add: function(name, resource) {
      resources[name] = resource;
      return this;
    }
  }
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
    var validations = anchorify(attrs);
    anchor.define(types || {});

    var validators = {};
    _.each(validations, function(curValidation, name) {
      validators[name] = function(value, setValidity) {
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
.factory('promiseTracker', function() {
  return function(promise) {
    var tracker = promise.then(function(value) {
      tracker.success = true;
    }, function(err) {
      tracker.error = err;
    }, function(progress) {
      tracker.progress = progress;
    })['finally'](function() {
      tracker.loading = false;
    });
    tracker.loading = true;
    return tracker;
  }
})
.directive('modelForm', ['Models', 'promiseTracker', function(Models, p) {

  var ModelFormCtrl = ['$scope', function ($scope) {
    var statuses = {};
    this.events = new Emitter();

    this.init = function(modelName) {
      console.log('init', modelName);
      var self = this;
      self.model = new (Models.get(modelName));
      console.log('model', this.model);
      var map = this.model.validators;
      _.each(map, function(val, key) {
        self.form[key] && self.form[key].$parsers.push(val.bind(self.form));
      });
    }

    this.action = function(action) {
      statuses[action] = p(this.model[action]());
    };

    this.status = function(action) {
      return statuses[action];
    }

    $scope.ModelForm = this;
  }];



  return {
    controller: ModelFormCtrl,
    require: 'modelForm',
    transclude: true,
    template: require('./modelsForm.html'),
    link: function(scope, element, attrs, ctrl) {
      console.log('link', scope, ctrl)
      ctrl.init(attrs.modelForm);
    } 
  }
}])
.directive('modelHref', ['$location', function($location) {
  return {
    require:'^modelForm',
    link: function(scope, element, attrs, ctrl) {
      var modelHref = attrs.modelHref;
      var e = modelHref.split(' ')[0];
      var href = modelHref.split(' ')[1];
      ctrl.events.on(e, function() {
        $location.path(href);
      })
    }
  }
}])
.run(['Models', '$resource', function(models, $resource){
  models
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
