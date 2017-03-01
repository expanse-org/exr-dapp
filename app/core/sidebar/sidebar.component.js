'use strict';
angular.
  module('sidebar').
  component('sidebar', {
    templateUrl: 'core/sidebar/sidebar.template.html',
    controller: function ($scope, $timeout, bondService) {
		var getBlock = function() {
			$scope.currentBlock=bondService.currentBlock();
			console.log("Block Poll:" +$scope.currentBlock);
			$timeout(getBlock, 10000);
		};
		getBlock();
    }
  });