(function () {
  'use strict';
  var app = angular.module('exrApp', [
    'ngAnimate',
    'ngRoute',
    'ngStorage',
    'angular-growl',
    'modal',
    'agreement',
    'connect',
    'accounts',
    'accountHistory',
    'accountList',
    'rewards',
    'exrList',
    'exrForm',
    'exrService',
    'exrTransfer',
    'dashhead',
    'dashboard',
    'deposit',
    'footer',
    'sidebar',
    'syncmodal'
  ]).config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $locationProvider.html5Mode(false);
    $routeProvider.when('/dashboard', {
      template: '<dashboard></dashboard>'
    }).when('/agreement', {
      template: '<agreement></agreement>'
    }).when('/accounts', {
      template: '<accounts></accounts>'
    }).when('/accounts/:account', {
      template: '<accounts></accounts>'
    }).when('/rewards', {
     template: '<rewards></rewards>'
    }).when('/deposit/:account', {
     template: '<deposit></deposit>'
    }).when('/exr/:account', {
     template: '<exr-form></exr-form>'
    }).otherwise({
      redirectTo: '/dashboard'
    });
  }]).config(['growlProvider', function(growlProvider) {
    growlProvider.onlyUniqueMessages(true);
    growlProvider.globalDisableCountDown(true);
  }]).controller('exrAppCtrl', function ($rootScope,$scope,$localStorage,exrService) {
    // App Initialization -- Load default values / generate objects in localStorage if they do not exist. 
    if(!$localStorage.connectionString) $localStorage.connectionString = "http://localhost:9656";
    if(!$localStorage.launchArgs) $localStorage.launchArgs = "--rpc --rpcaddr localhost"
    if(!$localStorage.history) $localStorage.history = {};
    if(!$localStorage.pending) $localStorage.pending = {};
    if(!$localStorage.autoLaunch) $localStorage.autoLaunch = false;
    if(!$localStorage.agreementConfirm) $localStorage.agreementConfirm=false;
    if(!$localStorage.lastBlock || $localStorage.lastBlock<600000) $localStorage.lastBlock=600000; //Earliest block a contract tx 
    if(!$localStorage.lastEvent || $localStorage.lastEvent<600000) $localStorage.lastEvent=600000;
    var vm = this;
    vm.$storage=$localStorage;
    vm.exrVars = exrService.exrVars;
    vm.$onInit = function () {
      exrService.init();
    };
  });
})();