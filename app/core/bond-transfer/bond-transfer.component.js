(function () {
  'use strict';
  angular.
  module('bondTransfer', []).
  component('bondTransfer', {
    bindings: { bond: '<' },
    templateUrl: 'core/bond-transfer/bond-transfer.template.html',
    controller: function (bondService, growl) {
      var vm = this;
      vm.transfer = function() {
        if(vm.transferTo==vm.bond.address) {
           growl.error('The address you have entered already owns this bond.', {title:"Transfer Error", ttl: -1}); 
           console.log('Transfer Error: The address you have entered already owns this bond.');
        }else if(!bondService.isAddressValid(vm.transferTo)){
           growl.error('The address you have entered does not seem to be a valid address.', {title:"Transfer Error", ttl: -1});
           console.log('Transfer Error: The address you have entered does not seem to be a valid address.');
        } else {
          bondService.confirmModal(
            "Confirm Trannsfer",
            "You are about to transfer Bond ID #" + vm.bond.id +" from account " + vm.bond.address + " to " + vm.transferTo + ".<br />Are you sure you wish to proceed?",
            function(){
              bondService.unlockedCall(vm.bond.address, function(){ 
                bondService.transfer(vm.bond.id, vm.transferTo, vm.bond.address);
              });
            }
          );
        }
      };
    }
  });
})();