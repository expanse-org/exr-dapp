'use strict';
angular.
module('deposit').
component('deposit', {
	bindings: { account: '<' },
	templateUrl: 'core/deposit/deposit.template.html',
	controller: function(bondService, growl) {
		this.state=0;
		this.deposit = function(depositVal) {
			if(!isNaN(parseFloat(depositVal))) {
				if(parseFloat(depositVal)>parseFloat(this.account.balance)){
					growl.error('Deposit value '+depositVal+' exceeds account balance for account '+this.account.address+'.', {title:"Deposit Error", ttl: -1});
				} else {
					
					if(bondService.deposit(this.account.address,this.depositVal)){
						this.state=1;
					} else {
						this.state=0;
					}
				}
			} else {
				growl.error('Deposit value is not a valid decimal number.', {title:"Deposit Error", ttl: -1});
			}
		};
		this.withdraw = function() {
			bondService.withdraw(this.account.address);
		};
        this.$onInit = function() {
			this.depositVal=1;
        };
    }
});
