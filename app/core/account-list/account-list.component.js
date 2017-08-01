(function () {
  'use strict';
  angular.
  module('accountList', []).
  component('accountList', {
    templateUrl: 'core/account-list/account-list.template.html',
    controller: function (exrService, $localStorage) {
      var vm = this;
      vm.userData = exrService.exrUserData;
      vm.$storage = $localStorage;
    
      vm.withdraw = function(account) {
        exrService.confirmModal(
          "Confirm Withdraw",
          "You are about to withdraw the entire available EXR wallet balance (" + account.exrBalance + " EXP) for expanse address " + account.address + ".<br />Are you sure you wish to proceed?",
          function() { 
            exrService.unlockedCall(account.address, function(){ exrService.withdraw(account.address); });
          }
         );
      };

      vm.createAccount = function () {
        exrService.newAccount(false, false);
      };
      
    }
  });
})();