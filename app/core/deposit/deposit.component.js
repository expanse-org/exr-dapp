(function () {
  'use strict';
  angular.
  module('deposit', []).
  component('deposit', {
    templateUrl: 'core/deposit/deposit.template.html',
    controller: function(exrService, growl, $location, $routeParams) {
      var vm = this;
      exrService.getAccount($routeParams.account).then(function(account){ vm.account = account; });
      vm.deposit = function() { 
        if(angular.isNumber(vm.depositVal) && vm.depositVal>0 && (vm.depositVal % 1 === 0) ) {
          if(parseInt(vm.depositVal,10) > parseInt(vm.account.balance,10)){
            growl.error('Deposit value ' + vm.depositVal + ' exceeds account balance for account ' + vm.account.address+'.', {title:"Deposit Error", ttl: -1});  
          } else {
              exrService.confirmModal(
                "Confirm Deposit",
                "You are about to deposit " + vm.depositVal + " EXP to EXR Wallet for account " + vm.account.address + ".<br />Are you sure you wish to proceed?",
                function() {
                  exrService.unlockedCall(vm.account.address, function(){ exrService.deposit(vm.account.address, vm.depositVal); });
                }
              );
          }
        } else {
          growl.error('Deposit value must be a valid whole (non decimal) number more than zero.', {title:"Deposit Error", ttl: -1});
        }  
      };
    
      vm.$onInit = function() { vm.depositVal = 1; };
      
    }
  });
})();