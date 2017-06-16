(function () {
  'use strict';
  angular.
  module('accountList', []).
  component('accountList', {
    templateUrl: 'core/account-list/account-list.template.html',
    controller: function (bondService, $localStorage) {
      var vm = this;
      vm.userData = bondService.ebsUserData;
      vm.$storage = $localStorage;
    
      vm.withdraw = function(account) {
        bondService.confirmModal(
          "Confirm Withdraw",
          "You are about to withdraw the entire available EBS wallet balance (" + account.bondBalance + " EXP) for expanse address " + account.address + ".<br />Are you sure you wish to proceed?",
          function() { 
            bondService.unlockedCall(account.address, function(){ bondService.withdraw(account.address); });
          }
         );
      };

      vm.createAccount = function () {
        bondService.newAccount(false, false);
      };
      
    }
  });
})();