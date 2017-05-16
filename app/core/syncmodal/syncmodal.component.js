(function () {
  'use strict';
  angular.
  module('syncmodal', []).
  component('syncmodal', {
    templateUrl: 'core/syncmodal/syncmodal.template.html',
    controller: function (bondService) {
      var vm = this;
      vm.ebsVars = bondService.ebsVars;
    }
  });
})();