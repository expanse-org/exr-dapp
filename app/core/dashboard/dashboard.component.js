'use strict';
angular.
module('dashboard').
component('dashboard', {
    controller: function(User, Bond, $scope, $localStorage) {
		this.accounts=User.getAccounts().length;
		this.bonds=User.listBonds().length;
		this.transfers=1;
    },
    templateUrl: 'core/dashboard/dashboard.template.html'
});
