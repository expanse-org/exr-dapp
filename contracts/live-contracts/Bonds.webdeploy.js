var abi = require('Bonds.abi.js');
var bytecode = require('Bonds.bytecode.js');

 var _limit = /* var of type uint256 here */ ;
 var _maturity = /* var of type uint256 here */ ;
 var _period = /* var of type uint256 here */ ;
 var _price = /* var of type uint256 here */ ;
 var _coupon = /* var of type uint256 here */ ;
 var _max = /* var of type uint256 here */ ;
 var bondsContract = web3.exp.contract(abi);
 var bonds = bondsContract.new(
    _limit,
    _maturity,
    _period,
    _price,
    _coupon,
    _max,
    {
      from: web3.exp.accounts[0],
      data: '0x'+bytecode,
      gas: '4700000'
    }, function (e, contract){
     console.log(e, contract);
     if (typeof contract.address !== 'undefined') {
          console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
     }
  })
