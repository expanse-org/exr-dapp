'use strict';
angular.
module('agreement').
component('agreement', {
    controller: function(User, Bond, $scope, $localStorage,$location,$window) {
        //load the candidate services so they get a headstart to load for the other components
        //this.candidates = [];
		console.log("hasConfirmed: "+$localStorage.agreementConfirm);
		  this.agree = function() {
			  console.log('agree');
				$localStorage.agreementConfirm=1;
				$window.location.reload();
		  }
    },
    templateUrl: 'core/agreement/agreement.template.html'
});
