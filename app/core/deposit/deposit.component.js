'use strict';
angular.
module('deposit').
component('deposit', {
	bindings: { account: '<' },
	templateUrl: 'core/deposit/deposit.template.html',
	controller: function(User) {
		this.deposit = function(depositVal) {
			User.deposit(this.account.address,this.depositVal);
		};
		this.withdraw = function() {
			User.withdraw(this.account.address);
		};
        this.$onInit = function() {
			this.depositVal=1;
        };
    }
});
