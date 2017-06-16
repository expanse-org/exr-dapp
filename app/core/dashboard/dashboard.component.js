(function () {
  'use strict';
  angular.
  module('dashboard',[]).
  component('dashboard', {
      controller: function(bondService) {
        var vm = this;
        vm.ebsUserData = bondService.ebsUserData;
        vm.ebsVars =  bondService.ebsVars;
        vm.transfers = 1;
      },
      templateUrl: 'core/dashboard/dashboard.template.html'
  });
})();