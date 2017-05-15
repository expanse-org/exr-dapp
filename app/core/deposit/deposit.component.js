(function () {
  'use strict';
  angular.
  module('deposit', []).
  component('deposit', {
    templateUrl: 'core/deposit/deposit.template.html',
    controller: function(bondService, growl, $location, $routeParams) {
      var vm = this;
      vm.account = bondService.getAccount($routeParams.account);
      var isInt = function(n) { return parseInt(n) === n };
      vm.deposit = function() { 
        if(angular.isNumber(vm.depositVal) && vm.depositVal>0 && (vm.depositVal % 1 === 0) ) {
          if(parseInt(vm.depositVal,10) > parseInt(vm.account.balance)){
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
          growl.error('Deposit value must be a valid whole (non decimal) number more than zero.', {title:"Deposit Error", ttl: -1});
        }  
      };
    
      vm.$onInit = function() {
        vm.depositVal=1;
        console.log('dposit init');
      };
      
    }
  });
})();