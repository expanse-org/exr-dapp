'use strict';
angular.
module('bondForm').
component('bondForm', {
    templateUrl: 'core/bond-form/bond-form.template.html',
    controller: function(bondService, $scope, $routeParams, growl) {
		this.$onInit = function() {
			this.account = bondService.getAccount($routeParams.account);
			this.multiplier = 1; 
		};

		this.buyBond = function() {
			if(!isNaN(parseInt(this.multiplier))) {
				this.account = bondService.getAccount($routeParams.account);
				if(parseInt(this.multiplier)*100>parseInt(this.account.bondBalance)){
					growl.error('Insufficient Funds: '+(parseInt(this.multiplier)*100)+' EXP is required to be deposited into the EBS contract wallet by account '+this.account.address+'. Current EBS Wallet Balance is '+this.account.bondBalance, {title:"Insufficient Funds", ttl: -1});
				} else {
					bondService.buyBond(this.multiplier, this.account.address);
				}
			} else {
				growl.error('Multiplier value is not a valid number.', {title:"Bond Purchase Error", ttl: -1});
			}
		};
	} 
});