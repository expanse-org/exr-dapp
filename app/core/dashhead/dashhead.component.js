(function () {
  'use strict';
  angular.
  module('dashhead',['ngRoute']).
  component('dashhead', {
      bindings: {
          title: '@'
      },
      templateUrl: 'core/dashhead/dashhead.template.html',
      controller: function() {}
  });
})();