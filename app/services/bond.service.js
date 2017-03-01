'user strict';
angular.module("bondService", []).
factory('bondService', function(growl, $localStorage) {
	var web3 = new Web3();
	console.log($localStorage.connectionString);
	if(!$localStorage.connectionString) $localStorage.connectionString="http://localhost:9656";
	connect();
	
	if(!$localStorage.lastblock || $localStorage.lastblock<500000) $localStorage.lastblock=500000;
	console.log('Current Block: '+$localStorage.lastblock);
    var contract = web3.eth.contract(Contract.abi);
	var bondContract = contract.at(Contract.address);
	var events = bondContract.allEvents({fromBlock: 500000,toBlock: 'latest'});
	events.watch(function(error, result) {
		if (error) {
			console.log("Event Read Error: "+error);
		} else {
			var addressList=web3.eth.accounts;
			if(addressList.indexOf(result.args.Sender) > -1 || addressList.indexOf(result.args.User) > -1){
				if(result.blockNumber>$localStorage.lastblock){
				  switch(result.event){
					case "Buys": growl.success("Your bond purchased has been successfully recorded on the blockchain.", {title:"Bond Purchase",ttl: -1});  break;
					case "Redemptions":  growl.success("Your bond has been redeemed.", {title:"Bond Redemption",ttl: -1});  break;
					case "Withdraws":  growl.success("Your withdraw has been completed.", {title:"Bond Contract Withdraw",ttl: -1});  break;
					case "Transfers": growl.success("Your transfer is complete and has been recorded on the blockchain.", {title:"Bond Transfer",ttl: -1});  break;
					case "Deposits":  growl.success("Your deposit has been completed.", {title:"Bond Contract Deposit",ttl: -1});  break;  
				   }
				   
				} else {
					console.log("Past Event("+result.blockNumber+">"+$localStorage.lastblock+"): "+result.event+", No notification required.");	
				}
			} else {
				// Event for an address not available in wallet	
			}
			if(result.blockNumber>$localStorage.lastblock) $localStorage.lastblock=result.blockNumber;
		}
	});
	function connect(){
		console.log('Connecting to '+$localStorage.connectionString);
		growl.info("Attempting to connect to expanse node at "+$localStorage.connectionString+".", {title:"Connection Attempt",ttl: 6700,disableCountDown: true}); 
		web3.setProvider(new web3.providers.HttpProvider($localStorage.connectionString));			
		//var ipcPath = '\\\\.\\pipe\\gexp.ipc'; 
		// var web3 = new Web3(new Web3.providers.IpcProvider(ipcPath));
		if(web3.isConnected()){
			growl.success("Connected to node: "+$localStorage.connectionString+".", {title:"Connection Successful",ttl: -1}); 
			return web3.isConnected();	
		} else {
			growl.error("Could not connect to expanse node at "+$localStorage.connectionString+".", {title:"Connection Error",ttl: -1}); 
			return false;
		}
	}
	
	function listBonds(account){
		var accounts=web3.eth.accounts;
		var bondList=[];
		angular.forEach(accounts, function(value, key) {
			var userbonds=bondContract.getUser.call(value)[2];
			angular.forEach(userbonds, function(value, key) {
				 if(bondList.indexOf(value.c[0]) === -1){ bondList.push(value.c[0]); }
			});
		});
		
		var bonds=[];
		angular.forEach(bondList, function(value, key) {	
			var bondData=bondContract.getBond.call(value);
			var bond= {id: value, created: bondContract.bonds(value)[5].c[0], active: bondData[0], address: bondData[1], multiplier: bondData[2].c[0], maturityBlock: bondData[3].c[0], lastRedemption:bondData[4].c[0]};
			bonds.push(bond);
		});
		return bonds;
	}
	
	function blockToTime(blockNum){
		var curBlock=web3.eth.blockNumber;
		var seconds=0;
		if(blockNum>curBlock){
			seconds=(blockNum-curBlock)*60;
		} else {
			var date=web3.eth.getBlock(blockNum).timestamp*1000;
			seconds = Math.floor((new Date() - date) / 1000);
		}
			
		var interval = Math.floor(seconds / 31536000);
		if (interval > 1) return interval + " years";
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) return interval + " months";
		interval = Math.floor(seconds / 86400);
		if (interval > 1) return interval + " days";
		interval = Math.floor(seconds / 3600);
		if (interval > 1) return interval + " hours";
		interval = Math.floor(seconds / 60);
		if (interval > 1) return interval + " minutes";
		return Math.floor(seconds) + " seconds";
		
	}
	

	// Fetch a Single Bond's information by Bond ID
	function fetchBond(bondId){
		var bondData=bondContract.getBond.call(bondId);
		var bond= {id: bondId, active: bondData[0], address: bondData[1], multiplier: bondData[2].c[0], maturityBlock: bondData[3].c[0], lastRedemption:bondData[4].c[0]};
		return bond;	
	}
	
	// Get balance of an address in the bond system
	function getBondBalance(address){
		return bondContract.getBalance.call(address);	
	}
	
	//deposit funds from acount into bond contract
	function deposit(address,amount){
		console.log('Depositing '+amount+' from account '+address+' to bond contract.');
		var tx= bondContract.deposit.sendTransaction({from: address, value:web3.toWei(amount,'ether')}, function(err, result){ 
			if(err) {
				console.log('Deposit Error: '+err);
				growl.error(err.message, {title:"Deposit Error", ttl: -1}); 
				return false;
			} else {
				growl.info("Your deposit of "+amount+" to Bond Contract for "+address+" has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"Bond Contract Deposit", ttl: -1});
				console.log('Deposit TX ID: '+result);
				growl.warning('Deposit TX ID: '+result, {ttl: -1});
			}
		});
        return tx;
     
	}
	
	//withdraw an accounts balance from bond contract
	function withdraw(address){
		console.log('Withdrawing bond contract balance for account '+address);
		var estGas= bondContract.withdraw.estimateGas({from: address});
		estGas+=Math.ceil(estGas*0.1); //buffer gas
		var tx= bondContract.withdraw.sendTransaction({from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Withdraw Error: '+err);
				growl.error(err.message, {title:"Withdraw Error", ttl: -1}); 
			} else {
				growl.info("Your Withdraw request for balance belonging to "+address+" has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"Bond Contract Deposit", ttl: -1});
				console.log('Withdraw TX ID: '+result);
				growl.warning('Withdraw TX ID: '+result, {ttl: -1});
			}
		});
		return tx;
	}
	
	function buyBond(multiplier, address){
		var estGas= bondContract.buy.estimateGas(multiplier, {from: address});
		estGas+=Math.ceil(estGas*0.1); //buffer gas
		console.log("estgas"+estGas);
		console.log('Bond purchase sent to blockchain. Multiplier: '+multiplier+' Account: '+address);
		var tx=bondContract.buy.sendTransaction(multiplier, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Bond Purchase Error: '+err);
				growl.error(err.message, {title:"Bond Purchase Error", ttl: -1}); 
				//throw err;
			} else {
				growl.info("Your bond purchase has been submitted for account "+address+" with Multiplier: "+multiplier+" Please be patient as it may take several minutes to be included in a block.", {title:"Bond Purchase", ttl: -1});
				console.log('Bond Purchase TX ID: '+result);
				growl.warning('Bond Purchase TX ID: '+result, {ttl: -1});
			}
		});
		return tx;
	}
	
	// redeem interest/coupons available to date
	function redeem(bondid, address){
		console.log('Redeeming mature balance for bond id: '+bondid+' owned by account:'+address);
		var estGas= bondContract.redeemCoupon.estimateGas(bondid, {from: address});
		estGas+=Math.ceil(estGas*0.1); //buffer gas
		var tx=bondContract.redeemCoupon.sendTransaction(bondid, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Redeem Coupon Error: '+err);
				growl.error(err.message, {title:"Bond Redemption Error", ttl: -1}); 
			} else {
				growl.info('Redeeming mature balance for Bond ID: '+bondid+' owned by account:'+address+". Please be patient as it may take several minutes to be included in a block.", {title:"Bond Redemption", ttl: -1});
				console.log('Redeem TX ID:'+result);
				growl.warning('Redeem TX ID: '+result, {ttl: -1});
			}
			
		});
		return tx;
	}
	
	function transfer(bondid, newAccount, address){
		console.log("Transfering Bond ID: "+bondid+"(owner: "+address+") to account "+newAccount+".");
		var estGas= bondContract.transfer.estimateGas(bondid, newAccount, {from: address});
		estGas+=Math.ceil(estGas*0.1); //buffer gas
		var tx=bondContract.transfer.sendTransaction(bondid, newAccount,{from: address, gas:400000}, function(err, result){ 
		if(err) {
				console.log('Transfer Error: '+err);
				growl.error(err.message, {title:"Bond Transfer Error", ttl: -1}); 
			} else {
				growl.info("Your transfer of Bond ID: "+bondid+" from "+address+" to "+newAccount+" has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"Bond Transfer", ttl: -1});
				console.log('Transfer TX ID:'+result);
				growl.warning('Transfer TX ID: '+result, {ttl: -1});
			}
		});
		return tx;
	}

    function getAccounts() {
		var accountList=web3.eth.accounts;
		var accounts=[];
		angular.forEach(accountList, function(value, key) {
			var account= { unlocked: isAccountUnlocked(value), address: value, balance: web3.fromWei(web3.eth.getBalance(value),"ether"), bondBalance: web3.fromWei(getBondBalance(value),"ether") };
			accounts.push(account);
		});
        return accounts;
    }
	
	  function getAccount(account) {
		var act=false;
		this.account=account;
		var accountList=web3.eth.accounts;
		angular.forEach(accountList, function(value, key) { 
			if(value==this.account) { 
				act= { unlocked: isAccountUnlocked(value), address: value, balance: web3.fromWei(web3.eth.getBalance(value),"ether"), bondBalance: web3.fromWei(getBondBalance(value),"ether") };
			}
		},this);
        return act;
    }
	
	function getAccountBalance(address){
		return web3.eth.getBalance(address);
	}
	
	function isAccountUnlocked(account){
		// There is currently no official way to check if an account is locked
		// This is a (hopefully temporary) hack to check if the account is unlocked, as it must be to sign
		var unlocked=false;
		try{
			var check=web3.eth.sign(account,"0x0000000000000000000000000000000000000000000000000000000000000000");
			unlocked=true;
		} catch(err) {
			unlocked=false;
		}
		return unlocked;
	}

	function isConnected(){
		return web3.isConnected();
	}
	
	function currentBlock(){
		return web3.eth.blockNumber;
	}
	
    return {
	  getAccount: getAccount,
      getAccounts: getAccounts,
	  getAccountBalance: getAccountBalance,
	  isAccountUnlocked: isAccountUnlocked,
	  getBondBalance: getBondBalance,
	  deposit: deposit,
	  withdraw: withdraw,
	  redeem: redeem,
	  listBonds: listBonds,
	  fetchBond: fetchBond, 
	  transfer: transfer,
	  buyBond: buyBond,
	  isConnected: isConnected,
	  connect: connect,
	  currentBlock: currentBlock,
	  blockToTime: blockToTime
    };
});
