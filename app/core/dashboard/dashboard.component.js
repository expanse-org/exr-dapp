(function () {
  'use strict';
  angular.
  module('dashboard',[]).
  component('dashboard', {
      controller: function(exrService) {
        var vm = this;
        vm.exrUserData = exrService.exrUserData;
        vm.exrVars =  exrService.exrVars;
        vm.transfers = 1;
      },
      templateUrl: 'core/dashboard/dashboard.template.html'
  });
})();