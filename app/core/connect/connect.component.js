(function () {
  'use strict';
  angular.
  module('connect', []).
  component('connect', {
    controller: function(bondService, $scope, $localStorage, $window, $rootScope) {
      var vm = this;
      vm.$storage = $localStorage;
      
      vm.configureLaunch = function(){
        vm.editingLaunch=true;	
      };
      
      vm.configureConnect = function(){
        vm.editingConnect=true;	
      };
      
      vm.connect = function() {
        bondService.connect();
      };
      
      vm.launchNode = function() {
        bondService.launchNode();
      };
      
      vm.$onInit = function() {
        vm.editing=false;
      };
      
    },
    templateUrl: 'core/connect/connect.template.html'
  });
})();