(function () {
  'use strict';
  angular.
  module('accountHistory', ['angularUtils.directives.dirPagination']).
  component('accountHistory', {
    bindings: { account: '<' },
    templateUrl: 'core/account-history/account-history.template.html',
    controller: function(bondService, $localStorage) {
      var vm = this;
      vm.history = $localStorage.history;
      vm.pending = $localStorage.pending;
      vm.showDetail = function(hEvent) {}
    }
  });
})();