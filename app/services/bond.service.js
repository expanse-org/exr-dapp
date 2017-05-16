'user strict';
angular.module("bondService", []).
factory('bondService', function(growl, $localStorage, $rootScope, $location, $timeout, $interval, $window) {
  const spawn = require('child_process').spawn;
  const remote = require('electron').remote;
  const spawnargs = require('spawn-args');
  const semver = require('semver');
  const fs = require('fs');
  const path = require('path');
  const web3 = new Web3();
  const net = require('net');
  
  var ebsVars = {
    version: require('./package.json').version,
    period:240,    //2628000
    maturity:1440, //15768000
    price: 2,      //100
    coupon: 1,
    ebsBal:0,
    currentBlock:0,
    bondsBal:0,
    bondsTotal:0,
    bondsAvail:0,
    minBlock:616100,
    isConnected:false,
    isSyncing:false,
    syncCurrentBlock:0,
    syncHighestBlock:0
  };
  
  var gexpChild;
  var events;
  var updateInterval;
  var lastEventBlock = $localStorage.lastBlock;
  var contract = $localStorage.ebsABI ? web3.eth.contract($localStorage.ebsABI) : web3.eth.contract(Contract.abi);
  var bondContract = contract.at(Contract.address);
  var updaterCont = web3.eth.contract(versionContract.abi);
  var updater = updaterCont.at(versionContract.address); 
  

  /*  App Functions  */
  
  var init = function() {
    
    if($localStorage.autoLaunch) {
      console.log('autolaunching node');
      launchNode();
    } else {
      connect(); 
    }
   
  };
  
  var closeWin = function(){ remote.getCurrentWindow().close(); };
    
  /*  Node/Connectivity Functions  */
  
  var launchNode = function(){
    var localPath = __dirname + '/gexp';
    if(process.platform=="win32") localPath += ".exe";
    fs.stat(path.resolve(localPath), function fsStat(err, stats) {
      if (err) {
        console.log("Could not launch node, "+err);
        growl.error("Could not launch embedded gexp instance. "+err, {title:"Error Launching Node", ttl: 11000});
      } else {
        gexpChild = spawn(path.resolve(localPath), spawnargs($localStorage.launchArgs), {
          detached: true,
          stdio: 'ignore'
        });
        growl.info("Launching embedded gexp node instance.", {title:"Launching Node", ttl: 11000});
        var timer = function() { if(!connect()) $timeout(timer(), 1500); };
        $timeout(timer(), 5000);
      }
    });
  };
  
  var closeNode = function(){ if(gexpChild){ gexpChild.kill(); } };
  
	var connect = function(){ 
		console.log('Connecting to ' + $localStorage.connectionString);
		growl.info("Attempting to connect to expanse node at " + $localStorage.connectionString+".", {title:"Connection Attempt", ttl: 9000}); 
    web3.setProvider(new web3.providers.HttpProvider($localStorage.connectionString));
		if(web3.isConnected()){
      ebsVars.isConnected = true;
			growl.success("Connected to node: " + $localStorage.connectionString + ".", {title:"Connection Successful", ttl: 9000}); 
      $location.path('/overview');
      $timeout(function(){checkUpdates(false, true);}, 1600);
      sync();
      updateInterval = $interval(updateBlock, 5000); //check if connected
			return true;	
		} else {
			growl.error("Could not connect to expanse node at " + $localStorage.connectionString + ".", {title:"Connection Error",ttl: 9000}); 
			console.log('Could NOT connect to: ' + $localStorage.connectionString);
	    return false;
		}
	};

  var sync = function(){
    web3.eth.isSyncing(function(error, sync){
        if(!error) {
            if(sync === true) {   // sync started
              ebsVars.isSyncing = true;
              web3.reset(true);
            } else if(sync) {    //sync obj exists = syncing
              ebsVars.syncCurrentBlock = sync.currentBlock;
              ebsVars.syncHighestBlock = sync.highestBlock;
              console.log('Syncing: ' + sync.currentBlock + ' / ' + sync.highestBlock);
              ebsVars.bondsTotal = bondContract.totalBonds();
              ebsVars.bondsAvail = bondContract.limitBonds()-ebsVars.bondsTotal;
              ebsVars.currentBlock = web3.eth.blockNumber;
              ebsVars.bondsBal =  web3.fromWei(web3.eth.getBalance(Contract.address));
              $localStorage.accounts = getAccounts();
            } else {
              ebsVars.isSyncing = false;
              //watchHistory(); //is connected, and is over block min?
            }
        }
    });
  };
  var updateBlock = function(){ 
    var wasConnected = ebsVars.isConnected;
    var _isConnected = web3.isConnected();
    if(_isConnected === true){
      //ebsVars.isConnected = _isConnected; // don't currently set, no auto re-connect, let user check
      // if(wasConnected == false) $location.path('/accounts'); // did we just reconnect after being dc'ed?
    } else {
       web3.reset();
       ebsVars.isConnected = false; // show user connect view
       if(wasConnected === true) { $interval.cancel(updateInterval);  } 
    }
  };

  var checkUpdates = function(useGithub, useContract){ 
    var showUpdate = false;
    var nodeVersion = semver.clean(web3.version.node.split("/")[1]);
    if(useGithub) {
      console.log('-- checking [github] for ' + process.platform + "-" + process.arch + ' updates --');
      $.getJSON("https://api.github.com/repos/expanse-org/bond-dapp/releases", function(data) {
        data.forEach(function(obj) {   
          var id = obj.id;
          var name = obj.name;
          var version = obj.tag_name.replace("[^\\d.]", "");
          var desc = obj.body; 
        });
      });
    } else if(useContract) {
      // priority enum: critical=0, urgent=1, important=2, normal=3, trivial=4
      console.log('-- checking [ebsVersion contract] for ' + process.platform + "-" + process.arch + ' updates --');
      console.log('EBS Contract - Local: ' + web3.version.node + " Remote: " + web3.toAscii(updater.latestContract()[1]));
      console.log('EBS ABI - Local: ' + web3.version.node + " Remote: " + web3.toAscii(updater.latestContract()[2]));
      console.log('EBS DApp - Local: ' + ebsVars.version + " Remote: " + web3.toAscii(updater.latestDApp()[0]));
      console.log('Gexp Node - Local: ' + nodeVersion + " Remote: " + web3.toAscii(updater.latestNode()[0]));

      if(semver.lt(ebsVars.version, web3.toUtf8(updater.latestDApp()[0]))) {
        console.log ('Upgrade Available');
        $('#modal').modal({"backdrop": "static"});
        $('#modalPassword, #modalSend').hide();
        $('#modalUpdate').hide();
        $('#modalYes, #modalNo').hide();
        $('#modalIgnore').show();
        $('#modalTitle').html("Update Available"); //or Required
        $('#modalDesc').html("An update for this dApp has been released. It is suggested you upgrade to the newest version immediately. The newest version is available at <a  target='_blank' href='https://github.com/expanse-org/bond-dapp/releases'>https://github.com/expanse-org/bond-dapp/releases</a>");
        $("#modalIgnore").off().on('click', function(){
  	      require('electron').shell.openExternal('https://github.com/expanse-org/bond-dapp/releases');
          $("#modal").modal("hide");
        });
      }
    }
  };


  /*  Data and Conversion Functions  */

	var blockToRelativeTime = function(blockNum){
		var curBlock = web3.eth.blockNumber;
		var seconds = 0;
		// If block is in the future, estimate based on expected avgBlocktime, otherwise query web3
		if(blockNum > curBlock){
			seconds = (blockNum - curBlock) * 60;
		} else {
			var date = web3.eth.getBlock(blockNum).timestamp*1000;
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
		
	};  // Determine how far from now a block is. (eg; 5s ago, 3 days ago, etc)

  var blockToTimestamp = function(block){ return web3.eth.getBlock(block).timestamp; };
 
 
  /*  EBS Functions  */

	var listBonds = function (account){
		var accounts = web3.eth.accounts;
		// Get IDs of bonds held by this account
		var bondList = [];
		angular.forEach(accounts, function(value, key) {
			var userbonds = bondContract.getUser.call(value)[2];
			angular.forEach(userbonds, function(value, key) {
				 if(bondList.indexOf(value.c[0]) === -1 && value.c[0]!=0) bondList.push(value.c[0]); 
			});
		});
		// Get bond data for each bond in bondList
		var bonds = [];
		angular.forEach(bondList, function(value, key) {	
			var bondData = bondContract.getBond.call(value);
			var bond = {id: value, active: bondData[0], address: bondData[1], multiplier: bondData[2].c[0], maturityTime: bondData[3].c[0], lastRedemption:bondData[4].c[0], nextRedemption:bondData[5].c[0], created:bondData[6].c[0], couponsRemaining:bondData[7].c[0]};
			bonds.push(bond);
		});
		return bonds;
	};
	
	var fetchBond = function (bondId){
		var bondData = bondContract.getBond.call(bondId);
		var bond = {id: bondId, active: bondData[0], address: bondData[1], multiplier: bondData[2].c[0], maturityTime: bondData[3].c[0], lastRedemption:bondData[4].c[0], nextRedemption:bondData[5].c[0], created:bondData[6].c[0], couponsRemaining:bondData[7].c[0]};
		return bond;	
	};
	
	var getBondBalance = function (address){ return bondContract.getBalance.call(address);	};
	
	var deposit = function(address,amount){
		console.log('Depositing ' + amount + ' from account ' + address + ' to bond contract.');
		var tx = bondContract.deposit.sendTransaction({from: address, value:web3.toWei(amount, 'ether')}, function(err, result){ 
			if(err) {
				console.log('Deposit Error: ' + err);
				growl.error(err.message, {title:"Deposit Error", ttl: -1}); 
				return false;
			} else {
        $location.path('/accounts');
				growl.info("Your deposit of " + amount + " to Bond Contract for " + address + " has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"Bond Contract Deposit", ttl: -1});
				console.log('Deposit TX ID: ' + result);
				growl.warning('Deposit TX ID: ' + result, {ttl: -1});
        addPending(address, "EBS Deposit", "Amount: " + amount + " EXP", result, null);
			}
		});
        return tx;
     
	};
	
	var withdraw = function(address){
		console.log('Withdrawing bond contract balance for account '+address);
		var tx= bondContract.withdraw.sendTransaction({from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Withdraw Error: '+err);
				growl.error(err.message, {title:"Withdraw Error", ttl: -1}); 
			} else {
				growl.info("Your Withdraw request for balance belonging to "+address+" has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"Bond Contract Withdraw", ttl: -1});
				console.log('Withdraw TX ID: '+result);
				growl.warning('Withdraw TX ID: '+result, {ttl: -1});
        addPending(address, "EBS Withdraw", "Amount: " + getAccount(address).bondBalance + " EXP", result, null);
			}
		});
		return tx;
	};
	
	var buyBond = function(multiplier, address){
		console.log('Bond purchase sent to blockchain. Multiplier: '+multiplier+' Account: ' + address);
		var tx = bondContract.buy.sendTransaction(multiplier, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Bond Purchase Error: '+err);
				growl.error(err.message, {title:"Bond Purchase Error", ttl: -1}); 
			} else {
        $location.path('/accounts');
				growl.info("Your bond purchase has been submitted for account " + address + " with Multiplier: " + multiplier + " Please be patient as it may take several minutes to be included in a block.", {title:"Bond Purchase", ttl: -1});
				console.log('Bond Purchase TX ID: ' + result);
				growl.warning('Bond Purchase TX ID: ' + result, {ttl: -1});
        addPending(address, "Bond Purchase", "Bond ID: (pending) - Multiplier: " + multiplier, result, null);
			}
		});
		return tx;
	};
	
	var collect = function(bondId, address){
		console.log('Redeeming mature balance for Bond ID: ' + bondId + ' owned by account: ' + address);
		var tx = bondContract.redeemCoupon.sendTransaction(bondId, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Redeem Coupon Error: ' + err);
				growl.error(err.message, {title:"Coupon Redemption Error", ttl: -1}); 
			} else {
        $location.path('/accounts');
				growl.info('Redeeming mature coupons for Bond ID: ' + bondId + ' owned by account: ' + address + ". Please be patient as it may take several minutes to be included in a block.", {title:"Coupon Redemption", ttl: -1});
				console.log('CouponRedeem TX ID:' + result);
				growl.warning('CouponRedeem TX ID: ' + result, {ttl: -1});
        var xBond = fetchBond(bondId);
        var timePassed = web3.eth.getBlock(xBond.created).timestamp - (xBond.nextRedemption - ebsVars.period);
        var periods = (timePassed - (timePassed % ebsVars.period)) / ebsVars.period;
        if(xBond.couponsRemaining < periods) periods = xBond.couponsRemaining;
        var amount = (xBond.multiplier * periods) * ebsVars.coupon;
        addPending(address, "Interest Redemption", "Bond ID: " + bondId + " - Coupons: " + periods + " - Amount: " + (periods*ebsVars.price) + " EXP", result, bondId);
			}
			
		});
		return tx;
	};
	
  var redeem = function(bondId, address){
		console.log('Redeeming mature balance for Bond ID: ' + bondId + ' owned by account:' + address);
		var tx = bondContract.redeemBond.sendTransaction(bondId, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Redeem Bond Error: '+err);
				growl.error(err.message, {title:"Bond Redemption Error", ttl: -1}); 
			} else {
        $location.path('/accounts');
				growl.info('Redeeming mature Bond ID: ' + bondId + ' owned by account:' + address + ". Please be patient as it may take several minutes to be included in a block.", {title:"Bond Redemption", ttl: -1});
				console.log('Redeem TX ID:' + result);
				growl.warning('Redeem TX ID: ' + result, {ttl: -1});
        var xBond = fetchBond(bondId);
        addPending(address, "Bond Redemption", "Bond ID: " + bondId + " - Amount: " + (xBond.multiplier*ebsVars.price) + " EXP", result, bondId);
			}
			
		});
		return tx;
	};
  
	var transfer = function(bondId, newAccount, address){
    var addressList = web3.eth.accounts;
		console.log("Transfering Bond ID: "+bondId+"(owner: "+address+") to account "+newAccount+".");
		var tx = bondContract.transfer.sendTransaction(bondId, newAccount,{from: address, gas:400000}, function(err, result){ 
		if(err) {
				console.log('Transfer Error: '+err);
				growl.error(err.message, {title:"Bond Transfer Error", ttl: -1}); 
			} else {
        $location.path('/accounts');
				growl.info("Your transfer of Bond ID: " + bondId + " from " + address + " to "+newAccount+" has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"Bond Transfer", ttl: -1});
				console.log('Transfer TX ID:'+result);
				growl.warning('Transfer TX ID: '+result, {ttl: -1});
        if(addressList.indexOf(address) > -1) addPending(address, "EBS Transfer Sent", "Bond ID: " + bondId + " - Transferred to " + newAccount.substring(0,16) + "...", result, bondId);
        if(addressList.indexOf(newAccount) > -1) addPending(newAccount, "EBS Transfer Recv", "Bond ID: " + bondId + " - Transferred from " + address.substring(0,16) + "...", result, bondId);
			}
		});
		return tx;
	};


  /*  Account Functions  */
    
  var getAccounts = function(){
    var accountList=web3.eth.accounts;
    var accounts=[];
    angular.forEach(accountList, function(value, key) {
      var account= { unlocked: isAccountUnlocked(value), address: value, balance: web3.fromWei(web3.eth.getBalance(value),"ether"), bondBalance: web3.fromWei(getBondBalance(value),"ether") };
      accounts.push(account);
    });
    return accounts;
  };

	var getAccount = function(account) {
		var act=false;
    var accountList=web3.eth.accounts;
		angular.forEach(accountList, function(value, key) { 
			if(value==account) { 
				act= { unlocked: isAccountUnlocked(value), address: value, balance: web3.fromWei(web3.eth.getBalance(value),"ether"), bondBalance: web3.fromWei(getBondBalance(value),"ether") };
			}
		},this);
    return act;
  };
	
	var getAccountBalance = function(address){ return web3.eth.getBalance(address); };
	
	var isAccountUnlocked = function(account){
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
	};
  
  var unlockedCall = function(addr, fn){
    if(!isAccountUnlocked(addr)){
      $('#modal').modal({"backdrop": "static"});
      $('#modalPassword, #modalSend').show();
      $('#modalUpdate, #modalIgnore').hide();
      $('#modalYes, #modalNo').hide();
      $('#modalTitle').html("Account Locked");
      $('#modalDesc').html("The account "+ addr + " is currently locked. Please enter the password for this account to continue with this transaction.");
      $("#modalSend").off().on('click', function() { 
        $("#modal").modal("hide");
        var pw=$("#modalPassword").val();
        $("#modalPassword").val("");
        unlockAccount(addr, pw, function(){ 
          fn();
        });
        $("#modalSend").off();
      });
      $('#modalPassword').focus();
    } else fn();
  };
  
  var confirmModal = function(title, msg, fnc){
    $('#modal').modal({"backdrop": "static"});
    $('#modalPassword, #modalSend').hide();
    $('#modalUpdate, #modalIgnore').hide();
    $('#modalYes, #modalNo').show();
    $('#modalTitle').html(title);
    $('#modalDesc').html(msg);
    $("#modalYes").off().on('click', function(){
      $("#modal").modal("hide");
      fnc();
      $("#modalYes").off();
    });
  };
  
  var newAccount = function(conf, confpw){
    $('#modal').modal({"backdrop": "static"});
    $('#modalPassword, #modalSend').show();
    $('#modalUpdate, #modalIgnore').hide();
    $('#modalYes, #modalNo').hide();
    
    if(conf===true) { 
      $('#modalTitle').html("Confirm Password for New Account");
      $('#modalDesc').html("Please confirm the password you selected by re-entering it below.");
    } else {
      $('#modalTitle').html("Create New Account");
      $('#modalDesc').html("Please enter a password for your new account.");
    }
    $("#modalSend").off().on('click', function(){
      $("#modal").modal("hide");
      var pw=$("#modalPassword").val();
      $("#modalPassword").val("");
      if(conf==true) {
        if(pw==confpw){
          var client = new net.Socket();
          var ipcPath = "\\\\.\\pipe\\gexp.ipc";
          var web3ipc = new Web3(new Web3.providers.IpcProvider(ipcPath,client));
          web3ipc.personal.newAccount(pw, function(error, result){
            if(!error) {
              growl.success("New account has succesfully been created.", {title:"Account Created.", ttl: -1}); 
              console.log("New account created.");
              $localStorage.accounts=getAccounts();
            } else {
              growl.error("Could not create account: " + error, {title:"Could not create account.", ttl: -1}); 
              console.log("Could not create account: " + error);
            }
          });
        } else {
          growl.error("The passwords you entered did not match.", {title:"Could not create account.", ttl: -1}); 
          console.log("Could not create account: The passwords you entered did not match.");
        }
      } else {
        newAccount(true, pw);
      }
      
    });
    $('#modalPassword').focus();
  };
  
  var unlockAccount = function(account,pw,cb){ 
    var client = new net.Socket();
    var ipcPath = "\\\\.\\pipe\\gexp.ipc";
    var web3ipc = new Web3(new Web3.providers.IpcProvider(ipcPath,client));
    web3ipc.personal.unlockAccount(account,pw,2, function(error, result){
      if(!error) cb(result);
      else {
        growl.error("Could not unlock account: "+error, {title:"Could not unlock account.", ttl: -1}); 
        console.error("Could not Unlock account: "+error);
      }
    })
  };
  
  var isAddressValid = function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) return false;
    else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) return true; 
    else {
      address = address.replace('0x','');
      var addressHash = web3.sha3(address.toLowerCase());
      for (var i = 0; i < 40; i++ ) {
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
          return false;
        }
      }
      return true;
    }
  };
  
  
  /*  History Functions  */

  var rebuildHistory = function () {
   var ev2 =  bondContract.allEvents({fromBlock: 600000, toBlock: $localStorage.lastEvent});
   ev2.get(function (error, results) {
    if (error) { 
      console.log("Event Read (2) Error: " + error); 
    } else {
      console.log("[Rebuilding History]");
      $.each( results, function( index, result ) {
        addResultHistory(result, false); 
      });
    }
   });  
  };
  
  var addResultHistory = function(result, isFresh) {
    var addressList=web3.eth.accounts; 
    var xObj = {};
    var xGrowl = {};
    xObj.block = result.blockNumber;
    if (typeof(result.args.BondId) != "undefined") xObj.bondId=result.args.BondId;
    //console.log('addResultHistory('+isFresh+'): result.blockNumber:' + result.blockNumber + '$localStorage.lastBlock:'+$localStorage.lastBlock);
    switch(result.event){
      case "Buys":
        xObj.address = result.args.User;
        xObj.info = "Bond ID: " + result.args.BondId + " - Multiplier: " + result.args.Multiplier;
        xObj.type = "Bond Purchase";
        xGrowl.message="Your bond purchased has been successfully recorded on the blockchain.";
        xGrowl.title = "Bond Purchase";
      break;
      case "RedeemCoupons":
        xObj.address = result.args.User;
        xObj.info = "Bond ID: "+result.args.BondId + " - Coupons: "+result.args.Coupons+" - Amount: " + web3.fromWei(result.args.Amount) + " EXP";
        xObj.type = "Interest Redemption";
        xGrowl.message = "Your coupon(s) has been redeemed.";
        xGrowl.title = "Coupon Redemption";
      break;
      case "RedeemBonds":
        xObj.address = result.args.User;
        xObj.info = "Bond ID: "+result.args.BondId+" - Amount: " + web3.fromWei(result.args.Amount) + " EXP";
        xObj.type = "Bond Redemption";
        xGrowl.message = "Your bond has been redeemed.";
        xGrowl.title = "Bond Redemption";
      break;
      case "Withdraws": 
        xObj.address = result.args.User;
        xObj.info = "Amount: " + web3.fromWei(result.args.Amount) + " EXP";
        xObj.type = "EBS Withdraw";
        xGrowl.message = "Your withdraw has been completed.";
        xGrowl.title = "Bond Contract Withdraw";
      break;
      case "Transfers": 
        var userIsFrom = false;
        if(addressList.indexOf(result.args.TransferFrom) > -1) {
          xObj.address = result.args.TransferFrom;
          xObj.info = "Bond ID: " + result.args.BondId + " Transferred to " + result.args.TransferTo.substring(0,16) + "...";
          xObj.type = "EBS Transfer Sent";
          userIsFrom = true;
        } 
        if(addressList.indexOf(result.args.TransferTo) > -1) {
          if(userIsFrom === true){ //User Is both from and to in xfer, add event to history for both accounts
            if(!$localStorage.history[xObj.address]) $localStorage.history[xObj.address] = [];
            if($.grep($localStorage.history[xObj.address], function( elm, indx ) {
        return ((JSON.stringify(elm) == JSON.stringify(xObj)) || (elm.tx == result.transactionHash));
      }).length<1) $localStorage.history[xObj.address].push(JSON.parse(JSON.stringify(xObj)));
            if($localStorage.pending[xObj.address]) $localStorage.pending[xObj.address] = $.grep($localStorage.pending[xObj.address], function( elm, indx ) { return elm.tx == result.transactionHash; }, true);
          } 
          xObj.address = result.args.TransferTo;
          xObj.info = "Bond ID: " + result.args.BondId + " Transferred from " + result.args.TransferFrom.substring(0,16) + "...";
          xObj.type = "EBS Transfer Recv";
        }
        xGrowl.message = "Your transfer is complete and has been recorded on the blockchain."; 
        xGrowl.title = "Bond Transfer";
      break;
      case "Deposits":
        xObj.address = result.args.Sender;
        xObj.info = "Amount: " + web3.fromWei(result.args.Amount) + " EXP";
        xObj.type = "EBS Deposit";
        xGrowl.message = "Your deposit has been completed."; 
        xGrowl.title = "Bond Contract Deposit";
      break;  
    } 
    
    if(!$localStorage.history[xObj.address]) { $localStorage.history[xObj.address] = []; }
    if($.grep($localStorage.history[xObj.address], function( elm, indx ) {
        return ((JSON.stringify(elm) == JSON.stringify(xObj)) || (elm.tx == result.transactionHash));
      }).length<1) {
        $localStorage.history[xObj.address].push(xObj);  
        if(isFresh) growl.success(xGrowl.message, {title:xGrowl.title, ttl: -1});
    } else { console.log('Duplicate History found.'); }

    if($localStorage.pending[xObj.address]) $localStorage.pending[xObj.address] = $.grep($localStorage.pending[xObj.address], function( elm, indx ) { return elm.tx == result.transactionHash; }, true);
  
  };
  
  var watchHistory = function () {
    // we clear and rebuild history incase user added a new account, a more proper elegant solution next ver
    $localStorage.history = {};
    rebuildHistory(); 
    events = bondContract.allEvents({fromBlock: ($localStorage.lastEvent+1), toBlock: 'latest'}, function (error, result) {
        if (error) { 
          console.log("Event Read Error: " + error);  
        } else {
          $localStorage.lastEvent = result.blockNumber;
          var addressList=web3.eth.accounts; 
          if(addressList.indexOf(result.args.Sender) > -1 || addressList.indexOf(result.args.User) > -1 || addressList.indexOf(result.args.TransferFrom) > -1 || addressList.indexOf(result.args.TransferTo) > -1){
            if(result.blockNumber > $localStorage.lastBlock){
              addResultHistory(result, true);  
            }
          } else {
            // Event for an address not available in wallet, [TODO: Add handling for watching multisig and remote wallets]
          }
          if(result.blockNumber>lastEventBlock) { 
            $localStorage.lastBlock = lastEventBlock;
            lastEventBlock = result.blockNumber;
          }
        }
      });
  };
  
  var addPending = function(address, type, info, tx, bondId){
    var xObj = {};
    if(!$localStorage.pending[address]) $localStorage.pending[address] = [];
    if (bondId) xObj.bondId=bondId;
    xObj.address=address;
    xObj.type = type;
    xObj.info = info; 
    xObj.tx = tx;
    $localStorage.pending[address].push(xObj);
    console.log('pending ebs tx ['+type+'] added, tx: ' + tx);
  };
 
  $window.onbeforeunload = function() {
    if(gexpChild){closeNode(); }
      /* confirmModal("Terminate gexp node instance?", "You are currently running a gexp node in the background. Do you want to terminate the node when you exit his application?",  closeNode);
    }
      return false;*/
  };
  
  return {
    ebsVars: ebsVars,
    init: init,
    launchNode: launchNode,
    connect: connect,
    closeNode: closeNode,
    closeWin: closeWin,
    unlockAccount: unlockAccount,
    unlockedCall: unlockedCall,
    confirmModal: confirmModal,
    newAccount: newAccount,
    getAccount: getAccount,
    getAccounts: getAccounts,
    getAccountBalance: getAccountBalance,
    isAccountUnlocked: isAccountUnlocked,
    isAddressValid: isAddressValid,
    listBonds: listBonds,
    fetchBond: fetchBond,
    getBondBalance: getBondBalance,
    deposit: deposit,
    withdraw: withdraw,
    redeem: redeem,
    collect: collect,
    buyBond: buyBond,
    transfer: transfer,
    blockToRelativeTime: blockToRelativeTime,
    blockToTimestamp: blockToTimestamp,
    addPending: addPending
  };
});