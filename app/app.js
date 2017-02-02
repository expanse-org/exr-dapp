'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('bondApp', [
    'ngAnimate',
    'ngRoute',
	'angular-growl',
	'ngStorage',
    'userService',
    'bondService',
	'agreement',
    'sidebar',
    'dashhead',
    'dashboard',
	'footer',
	
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
}]).controller('bondAppCtrl', function ($scope,$localStorage) {
//$localStorage.agreementConfirm=0;
 console.log($localStorage.agreementConfirm);
 $scope.hasConfirmed=$localStorage.agreementConfirm;
});