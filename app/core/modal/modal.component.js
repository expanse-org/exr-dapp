angular.
  module('modal', []).
  component('modal', {
    templateUrl: 'core/modal/modal.template.html',
    controller: function ($timeout, bondService) {
      var vm = this;
      vm.keypress = function(keyEvent) {
        if (keyEvent.which === 13) {
          $timeout(function() { angular.element('#modalSend').triggerHandler('click'); }, 0);
        }
      };
    }
  });