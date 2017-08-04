(function () {
  'use strict';
  angular.
  module('sidebar', []).
  component('sidebar', {
    templateUrl: 'core/sidebar/sidebar.template.html',
    controller: function (exrService, $localStorage) {
      var vm = this;
      vm.exrVars = exrService.exrVars;
      vm.pending = $localStorage.pending;
      vm.showSyncing = function () {
        if(vm.exrVars.isSyncing===true){
         $('#syncModal').modal({"backdrop": "static"});
        }
      };
    }
  });
})();