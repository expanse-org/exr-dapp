(function () {
  'use strict';
  angular.
  module('exrTransfer', []).
  component('exrTransfer', {
    bindings: { exr: '<' },
    templateUrl: 'core/exr-transfer/exr-transfer.template.html',
    controller: function (exrService, growl) {
      var vm = this;
      vm.transfer = function() {
        if(vm.transferTo==vm.exr.address) {
           growl.error('The address you have entered already owns this EXR.', {title:"Transfer Error", ttl: -1}); 
           console.log('Transfer Error: The address you have entered already owns this EXR.');
        }else if(!exrService.isAddressValid(vm.transferTo)){
           growl.error('The address you have entered does not seem to be a valid address.', {title:"Transfer Error", ttl: -1});
           console.log('Transfer Error: The address you have entered does not seem to be a valid address.');
        } else {
          exrService.confirmModal(
            "Confirm Trannsfer",
            "You are about to transfer EXR ID #" + vm.exr.id +" from account " + vm.exr.address + " to " + vm.transferTo + ".<br />Are you sure you wish to proceed?",
            function(){
              exrService.unlockedCall(vm.exr.address, function(){ 
                exrService.transfer(vm.exr.id, vm.transferTo, vm.exr.address);
              });
            }
          );
        }
      };
    }
  });
})();