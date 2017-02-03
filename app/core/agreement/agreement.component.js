'use strict';
angular.
module('agreement').
component('agreement', {
    controller: function(User, Bond, $scope, $localStorage,$location,$window) {
		console.log("hasConfirmed: "+$localStorage.agreementConfirm);
		  this.agree = function() {
			  console.log('agree');
				$localStorage.agreementConfirm=true;
				$window.location.reload();
		  }
    },
    templateUrl: 'core/agreement/agreement.template.html'
});
