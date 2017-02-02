'use strict';
angular.
module('bondForm').
component('bondForm', {
    templateUrl: 'core/bond-form/bond-form.template.html',
    controller: function(User, $scope, $routeParams) {
		this.$onInit = function() {
			this.account = $routeParams.account;
			this.multiplier = 1; 
		};
		this.buyBond = function() {
			User.buyBond(this.multiplier, this.account);
		};
	} 
});