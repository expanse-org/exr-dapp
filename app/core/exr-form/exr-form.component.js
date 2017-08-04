(function () {
  'use strict';
  angular.
  module('exrForm', []).
  component('exrForm', {
    templateUrl: 'core/exr-form/exr-form.template.html',
    controller: function(exrService, $scope, $routeParams, growl) {
      var vm = this;
      vm.exrVars = exrService.exrVars;
    
      exrService.getAccount($routeParams.account).then(function(account){ vm.account = account; });
      
      vm.$onInit = function() { vm.multiplier = 1; };
      
      vm.buyEXR = function() {
        if(!isNaN(vm.multiplier) && vm.multiplier > 0) {
          if((parseInt(this.multiplier, 10) * vm.exrVars.price) > parseInt(vm.account.exrBalance, 10)){
            growl.error('Insufficient Funds: ' + (vm.multiplier*vm.exrVars.price) + ' EXP is required to be deposited into the EXR contract wallet by account ' + this.account.address + '. Current EXR Wallet Balance is ' + vm.account.exrBalance , {title:"Insufficient Funds", ttl: -1});
          } else {
            if(parseInt(vm.multiplier, 10) <= vm.exrVars.exrAvail){
              exrService.confirmModal(
                "Confirm EXR Purchase",
                "You are about to purchase a EXR with a multiplier of " + vm.multiplier + " for a total of " + (vm.multiplier * vm.exrVars.price) + " EXP.<br />Are you sure you wish to proceed?",
                function() { 
                  exrService.unlockedCall(vm.account.address, function() { exrService.buyEXR(vm.multiplier, vm.account.address); });
                }
              );
            } else {
               growl.error('We are sorry, there are no longer enough available EXR to complete your request. We will announce when more EXR will be made available.', {title:"EXR Unavailable", ttl: -1});
            }
          }
        } else {
          growl.error('Multiplier value must be a valid whole number more than zero.', {title:"EXR Purchase Error", ttl: -1});
        }
      };
      
    } 
  });
})();