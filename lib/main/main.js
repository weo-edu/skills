require('angular');
require('angular-route');
var _ = require('underscore');

angular.module('app', [require('lib/resources'), 'ngRoute'])
.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true);
}])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/skills/new', {
    template: require('./skillsNew.html')
  })
  .when('/skill/:id', {
    template: require('./skill.html')
  })
  .when('/tag/:id', {
    template: require('./tag.html')
  })
  .when('/tags/new', {
    template: require('./tagsNew.html')
  })
  .when('/tags', {
    template: require('./tags.html')
  })
  .otherwise({
    template: require('./skills.html')
  });
}])
.directive('main', function() {
  return {
    template: require('./main.html')
  };
})
.controller('TagListCtrl', ['$scope', 'Models', function($scope, Models) {
  var Tag = Models.get('Tag');
  this.tags = Tag.query();
  this.search = function(query) {
    this.tags = query
      ? Tag.search({q: query})
      : Tag.query();
  };
}])
.controller('TagCtrl', ['Models', '$routeParams', function(Models, $routeParams) {
  var Tag = Models.get('Tag');
  this.tag = Tag.get({id: $routeParams.id});
}])
.controller('TagFormCtrl', ['Models', function(Models) {
  var Tag = Models.get('Tag');
  this.tag = new Tag();
}])
.controller('SkillListCtrl', ['$scope', 'Models', function($scope, Models) {
  var Skill = Models.get('Skill');
  this.skills = Skill.query();
  this.search = function(query) {
    this.skills = query
      ? Skill.search({q: query})
      : Skill.query();
  }
}])
.controller('SkillCtrl', ['Models', '$routeParams', function(Models, $routeParams) {
  var Skill = Models.get('Skill');
  this.skill = Skill.get({id: $routeParams.id});
}])
.controller('SkillFormCtrl', ['Models', function(Models) {
  var Skill = Models.get('Skill');
  this.skill = new Skill();
  this.skill.save = function() {
    console.log('save');
    var self = this;
    self.loading = true;
    self.action('$save');
    self.$save()
      .then(function() {
        self.loading = false;
      })
      .catch(function(err) {
        self.error = true;
      })
  }
}])
.filter('range', function() {
  return _.range.bind(_);
})
.config(['$provide', function($provide) {
  $provide.decorator('$rootScope', ['$delegate', function($delegate) {
    $delegate.__proto__.$$log = function() {
      return console.log.apply(console, arguments);
    };

    return $delegate;
  }]);
}])
.directive('validators', function() {
  return {
    require: 'form',
    link: function(scope, element, attrs, ctrl) {
      var map = scope.$eval(attrs.validators);
      _.each(map, function(val, key) {
        ctrl[key] && ctrl[key].$parsers.push(val.bind(ctrl));
      });
    }
  };
});