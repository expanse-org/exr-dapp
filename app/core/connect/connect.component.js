'use strict';
angular.
module('connect').
component('connect', {
	controller: function(User, Bond, $scope, $localStorage,$window, growl) {
		$scope.$localStorage = $localStorage;
		//growl.error("Could not connect to expanse node at "+$localStorage.connectionString+".", {title:"Connection Error",ttl: -1}); 
		this.configure = function(){
			this.editing=true;	
		}
		this.connect = function() {
			console.log('Checking Connection');
			if(User.connect()){
			  $window.location.reload();
			}
		};
		this.$onInit = function() {
			this.editing=false;
		};
	},
	templateUrl: 'core/connect/connect.template.html'
});
