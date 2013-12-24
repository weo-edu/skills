require('../');
require('angular');
angular.module('app', [require('../main.js')]);

describe('controller-inheritance', function() {
	it('emitter test', function() {
    var clicks = 0;
    angular
    .controller('Emitter', require('emitter'))
    .controller('InheritanceTest', ['$inherits', function($inherits) {
      $inherits('Emitter', this);
      this.on('clicked', function() {
        clicks++;
      });
    }]);

    expect(clicks).toBe(0);
    angular.element('<div ng-controller="InheritanceTest as it">'
      + '<div ng-click="it.emit(\'clicked\')"></div></div>')
    .children().click();
    expect(clicks).toBe(1);

	});
});