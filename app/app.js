(function () {
  'use strict';
  var app = angular.module('bondApp', [
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
    'bonds',
    'bondList',
    'bondForm',
    'bondService',
    'bondTransfer',
    'dashhead',
    'dashboard',
    'deposit',
    'footer',
    'sidebar'
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
    }).when('/bonds', {
     template: '<bonds></bonds>'
    }).when('/deposit/:account', {
     template: '<deposit></deposit>'
    }).when('/bond/:account', {
     template: '<bond-form></bond-form>'
    }).otherwise({
      redirectTo: '/dashboard'
    });
  }]).config(['growlProvider', function(growlProvider) {
    growlProvider.onlyUniqueMessages(true);
    growlProvider.globalDisableCountDown(true);
  }]).controller('bondAppCtrl', function ($rootScope,$scope,$localStorage,bondService) {
    // App Initialization -- Load default values / generate objects in localStorage if they do not exist. 
    if(!$localStorage.connectionString) $localStorage.connectionString = "http://localhost:9656";
    if(!$localStorage.launchArgs) $localStorage.launchArgs = "--rpc --rpcaddr localhost"
    if(!$localStorage.history) $localStorage.history = {};
    if(!$localStorage.accounts) $localStorage.accounts = {};
    if(!$localStorage.pending) $localStorage.pending = {};
    if(!$localStorage.autoLaunch) $localStorage.autoLaunch = false;
    if(!$localStorage.agreementConfirm) $localStorage.agreementConfirm=false;
    if(!$localStorage.lastBlock || $localStorage.lastBlock<600000) $localStorage.lastBlock=600000; //Earliest block a contract tx 
    if(!$localStorage.lastEvent || $localStorage.lastEvent<600000) $localStorage.lastEvent=600000;
    var vm = this;
    vm.$storage=$localStorage;
    vm.ebsVars = bondService.ebsVars;
    vm.$onInit = function () {
      console.log('-- app controll init --');
      bondService.init();
    };
  });
})();