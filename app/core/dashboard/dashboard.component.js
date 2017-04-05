'use strict';
angular.
module('dashboard').
component('dashboard', {
    controller: function(bondService, $scope, $localStorage) {
		this.accounts=bondService.getAccounts().length;
		this.bonds=bondService.listBonds().length;
		this.transfers=1;
    },
    templateUrl: 'core/dashboard/dashboard.template.html'
});
