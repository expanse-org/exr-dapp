(function () {
  'use strict';
  angular.
  module('exrList', []).
  component('exrList', {
    templateUrl: 'core/exr-list/exr-list.template.html',
    controller: function (exrService, $interval) {
      var vm = this;
      vm.userData = exrService.exrUserData; 
      vm.blockTimes = {}; 
      vm.date = Date.now();
      $interval(function(){vm.date = Date.now();}, 5000);
      
      vm.redeem = function(exrId, account){
        exrService.confirmModal(
          "Confirm Redemption",
          "You are about to redeem EXR ID #" + exrId +". This will deactivate the EXR as well as collect the value of the EXR as well as any unredeemed interest redemptions to EXR wallet for account " + account + ".<br />Are you sure you wish to proceed?",
          function() {
            exrService.unlockedCall(account, function(){ 
               exrService.redeem(exrId, account);
            });
          }
        );
      };
      
      vm.collect = function(exrId, account){
        exrService.confirmModal(
          "Confirm Collection",
          "You are about to collect all available interest redemptions on EXR ID #" + exrId + " to EXR Wallet for account " + account + ".<br />Are you sure you wish to proceed?",
          function() {
            exrService.unlockedCall(account, function(){ 
              exrService.collect(exrId, account);
            });
          }
        );
      };

      vm.$onInit = function () {
        $.each(vm.userData.exr, function(key, reward) {
          exrService.blockToRelativeTime(reward.created).then(function(resultTime){ 
            vm.blockTimes[reward.created] = resultTime;
            return exrService.blockToRelativeTime(reward.lastRedemption);
          }).then(function(resultTime){
            vm.blockTimes[reward.lastRedemption] = resultTime;
          });
        });
      };

    }
  });
})();