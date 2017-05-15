(function () {
  'use strict';
  angular.
  module('sidebar', []).
  component('sidebar', {
    templateUrl: 'core/sidebar/sidebar.template.html',
    controller: function (bondService, $localStorage) {
      var vm = this;
      vm.ebsVars = bondService.ebsVars;
      vm.pending = $localStorage.pending;
    }
  });
})();