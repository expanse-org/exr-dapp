(function () {
  'use strict';
  angular.
  module('syncmodal', []).
  component('syncmodal', {
    templateUrl: 'core/syncmodal/syncmodal.template.html',
    controller: function (exrService) {
      var vm = this;
      vm.exrVars = exrService.exrVars;
    }
  });
})();