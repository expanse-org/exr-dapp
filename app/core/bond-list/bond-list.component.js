angular.
  module('bondList').
  component('bondList', {
    templateUrl: 'core/bond-list/bond-list.template.html',
    controller: function (bondService) {
	 	this.bonds = bondService.listBonds();
		this.transfer = function(bondid, newAccount, account) {
	 		bondService.transfer(bondid, newAccount, account);
   		}
		this.redeem = function(bondid, account){
			bondService.redeem(bondid, account);	
		}
		this.blockToTime=function(blockNum){
			return bondService.blockToTime(blockNum);	
		}
		this.currentBlock=bondService.currentBlock();
	 }
  });