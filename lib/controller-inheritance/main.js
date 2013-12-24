var name = module.exports = require('./package.json').name;
require('angular');
angular.module(name, [])
.factory('$inherits', ['$controller', '$injector', function($controller, $injector) {
  return function(parentCtrl, self, locals) {
    if('string' === typeof parentCtrl) {
      var instance = $controller(parentCtrl, locals);
      parentCtrl = instance.constructor;
    }

    self.__proto__.__proto__ = parentCtrl.prototype;
    $injector.invoke(parentCtrl, self, locals);
  };
}])
.controller('Emitter', require('emitter'))
.controller('InheritanceTest', ['$inherits', function($inherits) {
  $inherits('Emitter', this);
  this.on('clicked', function() {
    alert('clicked');
  });
}])