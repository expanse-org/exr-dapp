(function () {
  'use strict';
  angular.
  module('deposit', []).
  component('deposit', {
    templateUrl: 'core/deposit/deposit.template.html',
    controller: function(bondService, growl, $location, $routeParams) {
      var vm = this;
      vm.account = bondService.getAccount($routeParams.account);
      
      vm.deposit = function() { 
        if(!isNaN(parseFloat(vm.depositVal)) && parseFloat(vm.depositVal) > 0) {
          if(parseFloat(vm.depositVal) > parseFloat(vm.account.balance)){
            growl.error('Deposit value ' + vm.depositVal + ' exceeds account balance for account ' + vm.account.address+'.', {title:"Deposit Error", ttl: -1});  
          } else {
            bondService.confirmModal(
              "Confirm Deposit",
              "You are about to deposit " + vm.depositVal + " EXP to EBS Wallet for account " + vm.account.address + ".<br />Are you sure you wish to proceed?",
              function() {
                bondService.unlockedCall(vm.account.address, function(){ bondService.deposit(vm.account.address, vm.depositVal); });
              }
            );
          }
        } else {
          growl.error('Deposit value is not a valid decimal number more than zero.', {title:"Deposit Error", ttl: -1});
        }  
      };
    
      vm.$onInit = function() {
        vm.depositVal=1;
        console.log('dposit init');
      };
      
    }
  });
})();