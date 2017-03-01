'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('bondApp', [
    'ngAnimate',
    'ngRoute',
	'angular-growl',
	'ngStorage',
    'bondService',
    'bondService',
	'agreement',
    'sidebar',
    'dashhead',
    'dashboard',
	'footer',
	'connect',
	'accounts',
	'accountList',
	'deposit',
	'about',
    'bonds',
	'bondList',
    'bondForm'
]).

config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.
    when('/dashboard', {
        template: '<dashboard></dashboard>'
    }).
	when('/agreement', {
        template: '<agreement></agreement>'
    }).
    when('/accounts', {
        template: '<accounts></accounts>'
    }).
	when('/accounts/:account', {
        template: '<accounts></accounts>'
    }).
    when('/bonds', {
        template: '<bonds></bonds>'
    }).
	when('/deposit/:account', {
        template: '<deposit></deposit>'
    }).
	when('/bond/:account', {
        template: '<bond-form></bond-form>'
    }).
    otherwise({
        redirectTo: '/dashboard'
    });

}]).directive('ngConfirmClick', [
    function(){
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick+"\nAre you sure you would like to continue?" || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click',function (event) {
                    if ( window.confirm(msg) ) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
}]).controller('bondAppCtrl', function ($scope,$localStorage,bondService) {
//$localStorage.agreementConfirm=false;
 $scope.hasConfirmed=$localStorage.agreementConfirm;
 if(!bondService.isConnected()) {
	 $scope.connected=false;
 } else $scope.connected=true;
}).config(['growlProvider', function(growlProvider) {
  growlProvider.onlyUniqueMessages(false);
}]);;