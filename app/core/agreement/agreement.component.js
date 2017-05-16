(function () {
  'use strict';
  angular.
  module('agreement', ['ngRoute']).
  component('agreement', {
      controller: function(bondService, $scope, $localStorage) {
      console.log("hasConfirmed: "+$localStorage.agreementConfirm);
        this.agree = function() {
          console.log('agree');
          $localStorage.agreementConfirm=true;
        };
      },
      templateUrl: 'core/agreement/agreement.template.html'
  });
})();