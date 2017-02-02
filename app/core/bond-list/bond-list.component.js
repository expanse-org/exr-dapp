angular.
  module('bondList').
  component('bondList', {
    templateUrl: 'core/bond-list/bond-list.template.html',
    controller: function (User) {
	 	this.bonds = User.listBonds();
		this.transfer = function(bondid, newAccount, account) {
	 		User.transfer(bondid, newAccount, account);
   		}
		this.redeem = function(bondid, account){
			User.redeem(bondid, account);	
		}
	 }
  });