(function () {
  'use strict';
  angular.
  module('accountHistory', []).
  component('accountHistory', {
    bindings: { account: '<' },
    templateUrl: 'core/account-history/account-history.template.html',
    controller: function(bondService, $localStorage) {
      var vm = this;
      vm.history = $localStorage.history;
      vm.pending = $localStorage.pending;
      vm.blockToTimestamp=bondService.blockToTimestamp;
      vm.showDetail = function(hEvent) {}
    }
  });
})();