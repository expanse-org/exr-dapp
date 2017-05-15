(function () {
  'use strict';
  angular.
  module('bondList', []).
  component('bondList', {
    templateUrl: 'core/bond-list/bond-list.template.html',
    controller: function (bondService) {
      
      var vm = this;
	 	  vm.bonds = bondService.listBonds();
      vm.date=new Date();
      
      vm.redeem = function(bondId, account){
        bondService.confirmModal(
          "Confirm Redemption",
          "You are about to redeem Bond ID #" + bondId +". This will deactivate the bond as well as collect the value of the bond as well as any unredeemed interest coupons to EBS wallet for account " + account + ".<br />Are you sure you wish to proceed?",
          function() {
            bondService.unlockedCall(account, function(){ 
               bondService.redeem(bondId, account);
            });
          }
        );
      };
      
      vm.collect = function(bondId, account){
        bondService.confirmModal(
          "Confirm Collection",
          "You are about to collect all available interest coupons on Bond ID #" + bondId +" to EBS Wallet for account " + account + ".<br />Are you sure you wish to proceed?",
          function() {
            bondService.unlockedCall(account, function(){ 
              bondService.collect(bondId, account);
            });
          }
        );
      };
      
      vm.blockToRelativeTime=function(blockNum){
        return bondService.blockToRelativeTime(blockNum);	
      };
        
    }
  });
})();