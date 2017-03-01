'use strict';
angular.
module('connect').
component('connect', {
	controller: function(bondService, $scope, $localStorage,$window) {
		$scope.$localStorage = $localStorage;
		this.configure = function(){
			this.editing=true;	
		}
		this.connect = function() {
			console.log('Checking Connection');
			if(bondService.connect()){
			  $window.location.reload();
			}
		};
		this.$onInit = function() {
			this.editing=false;
		};
	},
	templateUrl: 'core/connect/connect.template.html'
});
