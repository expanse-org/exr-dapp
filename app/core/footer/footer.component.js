(function () {
  'use strict';
  angular.
  module('footer', []).
  component('footer', {
    templateUrl: 'core/footer/footer.template.html',
    controller: function(bondService) {
      var vm = this;
      vm.version = bondService.ebsVars.version;
    }
  });
})();