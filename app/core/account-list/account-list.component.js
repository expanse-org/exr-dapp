// TODO: Bind a parameter to determine how many candidates to show
// TODO: Bind a parameter to show the "view all" button or not
angular.
  module('accountList').
  component('accountList', {
    templateUrl: 'core/account-list/account-list.template.html',
    controller: function (bondService) {
	 	this.accounts = bondService.getAccounts();		
	 }
  });