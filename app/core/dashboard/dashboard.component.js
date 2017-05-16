(function () {
  'use strict';
  angular.
  module('dashboard',[]).
  component('dashboard', {
      controller: function(bondService) {
        var vm = this;
        vm.accounts = bondService.getAccounts().length;
        vm.bonds = bondService.listBonds().length;
        vm.ebsVars =  bondService.ebsVars;
        vm.transfers = 1;
      },
      templateUrl: 'core/dashboard/dashboard.template.html'
  });
})();