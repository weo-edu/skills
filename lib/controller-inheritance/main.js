var name = module.exports = require('./package.json').name;
require('angular');
angular.module(name, [])
.factory('$inherits', ['$controller', '$injector', function($controller, $injector) {
  return function(parentCtrl, self, locals) {
    if('string' === typeof parentCtrl) {
      var instance = $controller(parentCtrl, locals);
      parentCtrl = instance.constructor;
    }

    // Ascend the prototype chain until we hit
    // Object.prototype (which should be the last link)
    // and then insert ourselves there
    var ptr = self;
    while(ptr.__proto__ !== Object.prototype)
      ptr = ptr.__proto__;
    ptr.__proto__ = parentCtrl.prototype;

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