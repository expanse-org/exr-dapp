(function () {
  'use strict';
  angular.
  module('footer', []).
  component('footer', {
    templateUrl: 'core/footer/footer.template.html',
    controller: function(exrService) {
      var vm = this;
      vm.version = exrService.exrVars.version;
    }
  });
})();