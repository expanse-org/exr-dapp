(function () {
  'use strict';
  angular.
  module('connect', []).
  component('connect', {
    controller: function(exrService, $scope, $localStorage, $window, $rootScope) {
      var vm = this;
      vm.$storage = $localStorage;
      
      vm.configureLaunch = function(){
        vm.editingLaunch=true;	
      };
      
      vm.configureConnect = function(){
        vm.editingConnect=true;	
      };
      
      vm.connect = function() {
        exrService.connect();
      };
      
      vm.launchNode = function() {
        exrService.launchNode();
      };
      
      vm.$onInit = function() {
        vm.editing=false;
      };
      
    },
    templateUrl: 'core/connect/connect.template.html'
  });
})();