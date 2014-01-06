require('jquery');
require('select2');
require('angular');
require('angular-ui-select2');

var name = module.exports = require('./package.json').name;

angular.module(name, ['ui.select2'])
.directive('tagSelect', ['Models', function(Models) {
	var Tag = Models.get('Tag');
	var TagSelectCtrl = ['$scope', '$attrs', '$element', function($scope, $attrs, $elem) {
		var one = $attrs.one;
		$scope.Tag = Tag;
		$scope.tags = $scope.$eval($attrs.tagSelect);
		if (one) {
			$elem.on('select2-opening', function() {
				$elem.select2('val', '');
			});
		}

	}];
	return {
		replace: true,
		scope: true,
		template: require('./main.html'),
		controller: TagSelectCtrl
	}
}]);

