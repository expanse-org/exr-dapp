(function () {
  'use strict';
  angular.
  module('bondForm', []).
  component('bondForm', {
    templateUrl: 'core/bond-form/bond-form.template.html',
    controller: function(bondService, $scope, $routeParams, growl) {
      var vm = this;
      vm.ebsVars = bondService.ebsVars;
      vm.account = bondService.getAccount($routeParams.account);
      
      vm.$onInit = function() { vm.multiplier = 1; };
      
      vm.buyBond = function() {
        if(!isNaN(vm.multiplier) && vm.multiplier > 0) {
          if( (parseInt(this.multiplier) * vm.ebsVars.price) > parseInt(this.account.bondBalance)){
            growl.error('Insufficient Funds: '+(vm.multiplier*vm.ebsVars.price)+' EXP is required to be deposited into the EBS contract wallet by account '+this.account.address+'. Current EBS Wallet Balance is '+vm.account.bondBalance, {title:"Insufficient Funds", ttl: -1});
          } else {
            if(parseInt(vm.multiplier) <= vm.ebsVars.bondsAvail){
              bondService.confirmModal(
                "Confirm Bond Purchase",
                "You are about to purchase a bond with a multiplier of " + vm.multiplier + " for a total of " + (vm.multiplier * vm.ebsVars.price) + "EXP.<br />Are you sure you wish to proceed?",
                function() { 
                  bondService.unlockedCall(vm.account.address, function() { bondService.buyBond(vm.multiplier, vm.account.address); });
                }
              );
            } else {
               growl.error('We are sorry, there is no longer enough available bonds to complete your request. We will announce when more bonds will be made available.', {title:"Bonds Unavailable", ttl: -1});
            }
          }
        } else {
          growl.error('Multiplier value must be a valid whole number more than zero.', {title:"Bond Purchase Error", ttl: -1});
        }
      };
      
    } 
  });
})();