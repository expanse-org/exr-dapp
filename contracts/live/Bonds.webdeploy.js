var abi = require('Bonds.abi.js');
var bytecode = require('Bonds.bytecode.js');

 var _lastContract = '0x88ACBc37b80Ea9f7692BaF3eb2390c8a34F02457';

 var bondsContract = web3.exp.contract(abi);
 var bonds = bondsContract.new(
    _lastContract,
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
