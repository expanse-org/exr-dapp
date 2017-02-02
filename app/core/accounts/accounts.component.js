'use strict';
angular.
module('accounts').
component('accounts', {
    controller: function($scope, $timeout) {
        // ONINIT
       // getAccounts();

        function getAccounts() {
           /* Account.getAccounts().then(function(data) {
                $scope.candidates = data;
                $timeout(getCandidates, 10000);
            });*/
        }
    },
    templateUrl: 'core/accounts/accounts.template.html'
});
