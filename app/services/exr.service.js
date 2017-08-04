'user strict';
angular.module("exrService", []).
factory('exrService', function(growl, $localStorage, $rootScope, $location, $timeout, $interval, $window, $q) {
  const spawn = require('child_process').spawn;
  const remote = require('electron').remote;
  const spawnargs = require('spawn-args');
  const semver = require('semver');
  const fs = require('fs');
  const path = require('path');
  const net = require('net');
  const os = require('os');
  const clipboard = new Clipboard('.clipb');
  const client = new net.Socket();
  const web3 = new Web3();

  var exrVars = {
    version: require('./package.json').version,
    period: 2628000,
    maturity: 15768000,
    price: 100,
    reward: 1,
    currentBlock: 0,
    exrBal: 0,
    exrTotal: 0,
    exrAvail: 0,
    minBlock: 616100,
    isConnected: false,
    isSyncing: false,
    syncCurrentBlock: 0,
    syncHighestBlock: 0,
    syncStartTime: Date.now(),
    syncTimeSpent: "",
    syncTimeLeft: "",
    syncCount: 0
  };

  var exrUserData = { accounts:[], exr:[] };
  var gexpChild;
  var events;
  var updateInterval;
  var hWatch = false;
  var lastEventBlock = $localStorage.lastBlock;
  var contract = $localStorage.ebsABI ? web3.eth.contract($localStorage.ebsABI) : web3.eth.contract(Contract.abi);
  var exrContract = contract.at(Contract.address);
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
  
  var defaultIpcPath = function() {
    //if($localStorage.settings.ipcPath)
    var ipcPath = os.homedir();
    switch(process.platform) {
      case "win32":
        ipcPath = '\\\\.\\pipe\\gexp.ipc';
        break;
      case "darwin":
        ipcPath += '/Library/Expanse/gexp.ipc';
      break;
      case "linux": 
      case "freebsd": 
      case "sunos": 
        ipcPath += '/.expanse/gexp.ipc';
      break;
    }
    return  ipcPath;
  };
  
  var closeWin = function(){ remote.getCurrentWindow().close(); };

  $window.onbeforeunload = function() {
    if(gexpChild){ closeNode(); }
  };
    
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
        $timeout(connect(), 9000);
      }
    });
  };
  
  var closeNode = function(){ if(gexpChild){ gexpChild.kill(); } };
  
  var handleError = function(source, err) { console.log(err); }

	var connect = function(){ 
		console.log('Attemping to connect to ' + $localStorage.connectionString);
		growl.info("Attempting to connect to expanse node at " + $localStorage.connectionString + ".", {title:"Connection Attempt", ttl: 9000}); 
    web3.setProvider(new Web3.providers.IpcProvider(defaultIpcPath(), client));
    //web3.setProvider(new web3.providers.HttpProvider($localStorage.connectionString));
    web3.net.getListening(function(error, result){
      if(error) {
			  growl.error("Could not connect to expanse node at " + $localStorage.connectionString + ".", {title:"Connection Error", ttl: 9000}); 
			  console.log('Could NOT connect to: ' + $localStorage.connectionString);
      } else {
        exrVars.isConnected = true;
        growl.success("Connected to node: " + $localStorage.connectionString + ".", {title:"Connection Successful", ttl: 9000}); 
        $location.path('/overview');
        updateBlock().then(function() {
          syncCheck();
          if(exrVars.currentBlock > exrVars.minBlock) {
           // $timeout(function(){ checkUpdates(false, true); }, 1600);
            hWatch = true;
            watchHistory(); 
          }
          updateInterval = $interval(updateBlock, 5000); //check if connected
        }); 
      }
    });
	};

  var syncCheck = function(){
   web3.eth.isSyncing(function(error, sync){
      if(!error) {
        if(sync === true) {   // sync started
          exrVars.syncStartTime = Date.now();
          exrVars.isSyncing = true;
          web3.reset(true);
          exrVars.syncCount = 0;
        } else if(sync) {    //sync obj exists = syncing
          if(exrVars.syncCount == 2) $("#syncModal").modal("show");
          var endTime = Date.now();
          exrVars.syncCount++;
          var time_duration = (endTime - exrVars.syncStartTime) / 1000;
          exrVars.syncTimeSpent = secToRelativeTime(time_duration);
          exrVars.syncTimeLeft = secToRelativeTime((((time_duration) / exrVars.syncCount)) * (sync.highestBlock-sync.currentBlock));
          exrVars.syncCurrentBlock = sync.currentBlock;
          exrVars.syncHighestBlock = sync.highestBlock;
          exrContract.totalBonds(function(error, res){
            exrVars.exrTotal = res;
            exrContract.limitBonds(function(error2, res2){
              exrVars.exrAvail = res2 - exrVars.exrTotal;
            });
          });
          refreshAccounts();
          refreshEXR();
        } else { //either sanc or not connected
          exrVars.isSyncing = false;
          web3.eth.getBlockNumber(function(error, result){ if(!error) exrVars.currentBlock = result; });
          $("#syncModal").modal("hide");
          if(hWatch === false && exrVars.currentBlock > exrVars.minBlock) { 
            hWatch = true;
           // $timeout(function(){ checkUpdates(false, true); }, 1600);
            watchHistory();
          }
        }
      }
    });
  };
  
  var updateBlock = function(){ 
    return $q(function(resolve, reject) {
      var wasConnected = exrVars.isConnected;
      web3.net.getListening(function(error, result){
        if(error || result !== true) {
          web3.reset();
          exrVars.isConnected = false;
          if(wasConnected === true) { $interval.cancel(updateInterval);  }
          if(error) { reject(error); } else { resolve(result); }
        } else {
          refreshAccounts().then(function() { return refreshEXR(); })
          .then(function(exr) {  return getBlockNumber(); })
          .then(function(blockNum) { exrVars.currentBlock = blockNum; return getBalance(Contract.address); })
          .then(function(balance) { 
            exrVars.exrBal = web3.fromWei(balance);
            exrContract.totalBonds(function(error, res){
              exrVars.exrTotal = res;
              exrContract.limitBonds(function(error2, res2){
                exrVars.exrAvail = res2 - exrVars.exrTotal;
                resolve(true);
              }) 
            });
            //exrVars.isConnected = _isConnected; // don't currently set, no auto re-connect, let user check
            //if(wasConnected == false) $location.path('/accounts'); // did we just reconnect after being dc'ed?
          });
        }
      });
    });
  };

  var checkUpdates = function(useGithub, useContract){ 
    var showUpdate = false;
    var nodeVersion = semver.clean(web3.version.node.split("/")[1]);
    console.log('checking updates');
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
      console.log('-- checking [exrVersion contract] for ' + process.platform + "-" + process.arch + ' updates --');
      console.log('EXR Contract - Local: ' + web3.version.node + " Remote: " + web3.toAscii(updater.latestContract()[1]));
      console.log('EXR ABI - Local: ' + web3.version.node + " Remote: " + web3.toAscii(updater.latestContract()[2]));
      console.log('EXR DApp - Local: ' + exrVars.version + " Remote: " + web3.toAscii(updater.latestDApp()[0]));
      console.log('Gexp Node - Local: ' + nodeVersion + " Remote: " + web3.toAscii(updater.latestNode()[0]));
      if(semver.lt(exrVars.version, web3.toUtf8(updater.latestDApp()[0]))) {
        console.log ('Upgrade Available');
        $('#modal').modal({"backdrop": "static"});
        $('#modalPassword, #modalSend').hide();
        $('#modalUpdate').hide();
        $('#modalYes, #modalNo').hide();
        $('#modalIgnore').show();
        $('#modalTitle').html("Update Available"); //or Required
        $('#modalDesc').html("An update for this dApp has been released. It is suggested you upgrade to the newest version immediately. The newest version is available at <a  target='_blank' href='https://github.com/expanse-org/rewards-dapp/releases'>https://github.com/expanse-org/rewards-dapp/releases</a>");
        $("#modalIgnore").off().on('click', function(){
  	      require('electron').shell.openExternal('https://github.com/expanse-org/rewards-dapp/releases');
          $("#modal").modal("hide");
        });
      }
    }
  };


  /*  Data and Conversion Functions  */
  
  var secToRelativeTime = function(seconds) {
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
  };
  
	var blockToRelativeTime = function(blockNum){
    return $q(function(resolve, reject) {
      getBlockNumber().then(function(curBlock){ 
        blockToTimestamp(blockNum).then(function(timestamp){
          if(blockNum > curBlock){
             resolve(secToRelativeTime((blockNum - curBlock) * 60));
          } else {
            resolve(secToRelativeTime(Math.floor((new Date() - (timestamp*1000)) / 1000)));
          }
        });
      });
    });
	};  // Determine how far from now a block is. (eg; 5s ago, 3 days ago, etc)


  var blockToTimestamp = function(blockNum){
    return $q(function(resolve, reject) {
      web3.eth.getBlock(blockNum, function(error, block){
        if(error) {
          reject(error);
        } else {
          resolve(block.timestamp);
        }
      });
    });
  };

  /*  Promisified Web3 Functions */
 
  var getBlockNumber = function(){
    return $q(function(resolve, reject) {
       web3.eth.getBlockNumber(function(error, curBlock){ 
          if(error) {
            reject(error);
          } else {
            resolve(curBlock);
          }
       });
    });
  };

  var getBalance = function(address){
    return $q(function(resolve, reject) {
       web3.eth.getBalance(address, function(error, balance){ 
          if(error) {
            reject(error);
          } else {
            resolve(balance);
          }
       });
    });
  };


  /*  EXR Functions  */

	var refreshEXR = function() {
    return $q(function(resolve, reject) {
      web3.eth.getAccounts(function(error, accounts) {
        if(error) { 
          handleError('refreshEXR - getAccounts', error);
          reject(error);
        } else {
          var exr = [];
          var promises = [];
          $.each(accounts, function(accountKey, account) {
            var deferred = $q.defer();
            promises.push(deferred.promise);
            getUserEXR(account).then(function(result){
              if(result != 0) {
                var promises2 = [];
                $.each(result, function(rewardKey, exrId) {
                  if(exrId != 0) { 
                    var deferred2 = $q.defer();
                    promises2.push(deferred2.promise);
                    fetchEXR(exrId).then(function(reward){
                      exr.push(reward);
                      deferred2.resolve(true);
                    });
                  }
                });
                $q.all(promises2).then(function(data){
                  deferred.resolve(true);
                });
              } else {
                deferred.resolve(true);
              }
            });
          });

          $q.all(promises).then(function(data){
            exr = exr.sort(function(a,b) { return a.id - b.id; } ); 
            if(!angular.equals(exrUserData.exr, exr)) { 
              console.log('Updating EXR...');
              exrUserData.exr = exr;
            }
            resolve();
          });
        }
      });
    });
	};
    
	var getUserEXR = function(address){
    return $q(function(resolve, reject) {
      exrContract.getUser.call(address, function(error, user){
        var promises = [];
        var result = [];
        if(user[2].length > 0) {
          $.each(user[2], function(key, exrId) {
            exrId=exrId.toString();
            var deferred = $q.defer();
            promises.push(deferred.promise);
            result.push(exrId);
            deferred.resolve(exrId);    
          });
          $q.all(promises).then(function(data){
            resolve(result);
          });
        } else {
          resolve(false);
        }
      });
    });
  };

	var fetchEXR = function(exrId) {
    return $q(function(resolve, reject) {
		  exrContract.getBond.call(exrId, function(error, exrData) {
        if(error) { 
          reject(error);
        } else {
		      resolve({id: exrId, active: exrData[0], address: exrData[1], multiplier: exrData[2].c[0], maturityTime: exrData[3].c[0], lastRedemption:exrData[4].c[0], nextRedemption:exrData[5].c[0], created:exrData[6].c[0], rewardsRemaining:exrData[7].c[0], $state:1});
        }
      });
    });
	};
	
	var getEXRBalance = function(address) {
    return $q(function (resolve, reject) {
      exrContract.getBalance.call(address, function(error, balance) {
        if(error) { 
          reject(error);
        } else {
          resolve(balance);
        }
      });
    });
  };
	
	var deposit = function(address,amount) {
		console.log('Depositing ' + amount + ' from account ' + address + ' to EXR contract.');
		var tx = exrContract.deposit.sendTransaction({from: address, value:web3.toWei(amount, 'ether')}, function(err, result){ 
			if(err) {
				console.log('Deposit Error: ' + err);
				growl.error(err.message, {title:"Deposit Error", ttl: -1}); 
				return false;
			} else {
        $location.path('/accounts');
				growl.info("Your deposit of " + amount + " to EXR Contract for " + address + " has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"EXR Contract Deposit", ttl: -1});
				console.log('Deposit TX ID: ' + result); 
				growl.warning('Deposit TX ID: ' + result + '<img src="public/img/clipboard.png" data-clipboard-text="' + result + '" class="clipb" width="16" height="16" />', {ttl: -1});
        addPendingHistory(address, "EXR Deposit", "Amount: " + amount + " EXP", result, null);
			}
		});
    return tx;
	};
	
	var withdraw = function(address){
		console.log('Withdrawing EXR contract balance for account '+address);
	  	exrContract.withdraw.sendTransaction({from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Withdraw Error: '+err);
				growl.error(err.message, {title:"Withdraw Error", ttl: -1}); 
			} else {
        $.each(exrUserData.accounts, function(index,value){ if(value.address == address) { value.$state = 3; } });
				growl.info("Your Withdraw request for balance belonging to " + address + " has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"EXR Contract Withdraw", ttl: -1});
				console.log('Withdraw TX ID: ' + result);
				growl.warning('Withdraw TX ID: ' + result + '<img src="public/img/clipboard.png" data-clipboard-text="' + result + '" class="clipb" width="16" height="16" />', {ttl: -1});
        getAccount(address).then(function(account){ addPendingHistory(address, "EXR Withdraw", "Amount: " + account.exrBalance + " EXP", result, null); });
			}
		});
	};
	
	var buyEXR = function(multiplier, address){
		console.log('EXR purchase sent to blockchain. Multiplier: ' + multiplier + ' Account: ' + address);
		var tx = exrContract.buy.sendTransaction(multiplier, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('EXR Purchase Error: ' + err);
				growl.error(err.message, {title:"EXR Purchase Error", ttl: -1}); 
			} else {
        $location.path('/accounts');
				growl.info("Your EXR purchase has been submitted for account " + address + " with Multiplier: " + multiplier + " Please be patient as it may take several minutes to be included in a block.", {title:"EXR Purchase", ttl: -1});
				console.log('EXR Purchase TX ID: ' + result);
				growl.warning('EXR Purchase TX ID: ' + result + '<img src="public/img/clipboard.png" data-clipboard-text="' + result + '" class="clipb" width="16" height="16" />', {ttl: -1});
        addPendingHistory(address, "EXR Purchase", "EXR ID: (pending) - Multiplier: " + multiplier, result, null);
			}
		});
		return tx;
	};
	
	var collect = function(exrId, address){
		console.log('Redeeming mature balance for EXR ID: ' + exrId + ' owned by account: ' + address);
		exrContract.redeemReward.sendTransaction(exrId, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Redeem Reward Error: ' + err);
				growl.error(err.message, {title:"Reward Redemption Error", ttl: -1}); 
			} else {
        $.each(exrUserData.exr, function(index,value){ if(value.id == exrId) { value.$state = 3; } });
        $location.path('/accounts');
				growl.info('Redeeming mature redemptions for EXR ID: ' + exrId + ' owned by account: ' + address + ". Please be patient as it may take several minutes to be included in a block.", {title:"Coupon Redemption", ttl: -1});
				console.log('Reward Redeem TX ID:' + result);
				growl.warning('REward Redeem TX ID: ' + result + '<img src="public/img/clipboard.png" data-clipboard-text="' + result + '" class="clipb" width="16" height="16" />', {ttl: -1});
        fetchEXR(exrId).then(function(xEXR) {
          var timePassed = Math.floor(Date.now() / 1000) - (xEXR.nextRedemption - exrVars.period);
          var periods = (timePassed - (timePassed % exrVars.period)) / exrVars.period;
          if(xEXR.rewardsRemaining < periods) periods = xEXR.rewardsRemaining;
          var amount = (xEXR.multiplier * periods) * exrVars.coupon;
          addPendingHistory(address, "Interest Redemption", "EXR ID: " + exrId + " - Redemptions: " + periods + " - Amount: " + (periods*exrVars.price) + " EXP", result, exrId);
        });
			}
		});
	};
	
  var redeem = function(exrId, address){
		console.log('Redeeming mature balance for EXR ID: ' + exrId + ' owned by account:' + address);
		var tx = exrContract.redeemBond.sendTransaction(exrId, {from: address, gas:400000}, function(err, result){ 
			if(err) {
				console.log('Redeem EXR Error: '+err);
				growl.error(err.message, {title:"EXR Redemption Error", ttl: -1}); 
			} else {
        $.each(exrUserData.exr, function(index,value){ if(value.id == exrId) { value.$state = 4; } });
        $location.path('/accounts');
				growl.info('Redeeming mature EXR ID: ' + exrId + ' owned by account:' + address + ". Please be patient as it may take several minutes to be included in a block.", {title:"EXR Redemption", ttl: -1});
				console.log('Redeem TX ID:' + result);
				growl.warning('Redeem TX ID: ' + result + '<img src="public/img/clipboard.png" data-clipboard-text="' + result + '" class="clipb" width="16" height="16" />', {ttl: -1});
        fetchEXR(exrId).then(function(xEXR) {
          addPendingHistory(address, "EXR Redemption", "EXR ID: " + exrId + " - Amount: " + (xEXR.multiplier*exrVars.price) + " EXP", result, exrId);
        });
			}
		});
		return tx;
	};
  
	var transfer = function(exrId, newAccount, address){
		console.log("Transfering EXR ID: " + exrId + "(owner: " + address + ") to account " + newAccount + ".");
		var tx = exrContract.transfer.sendTransaction(exrId, newAccount,{from: address, gas:400000}, function(err, result){ 
		if(err) {
				console.log('Transfer Error: ' + err);
				growl.error(err.message, {title:"EXR Transfer Error", ttl: -1}); 
			} else {
         $.each(exrUserData.exr, function(index,value){ if(value.id == exrId) { value.$state = 4; } });
        web3.eth.getAccounts(function(error, addressList){
          $location.path('/accounts');
				  growl.info("Your transfer of EXR ID: " + exrId + " from " + address + " to " + newAccount + " has been submitted, please be patient as it may take several minutes to be included in a block.", {title:"EXR Transfer", ttl: -1});
				  console.log('Transfer TX ID:' + result);
				  growl.warning('Transfer TX ID: ' + result + '<img src="public/img/clipboard.png" data-clipboard-text="' + result + '" class="clipb" width="16" height="16" />', {ttl: -1});
          if(addressList.indexOf(address) > -1) addPendingHistory(address, "EXR Transfer Sent", "EXR ID: " + exrId + " - Transferred to " + newAccount.substring(0,16) + "...", result, exrId);
          if(addressList.indexOf(newAccount) > -1) addPendingHistory(newAccount, "EXR Transfer Recv", "EXR ID: " + exrId + " - Transferred from " + address.substring(0,16) + "...", result, exrId);
        });
			}
		});
		return tx;
	};


  /*  Account Functions  */

  var refreshAccounts = function(){
    return $q(function(resolve, reject) {
      web3.eth.getAccounts(function(error, accountList){ 
        if(error) {
          reject(error); 
        } else {
          var accounts = [];
          var promises = [];
          angular.forEach(accountList, function(account, key) {
            var deferred = $q.defer();
            promises.push(deferred.promise);
            var act = { id:key, address:account, balance:0, exrBalance :0, unlocked:false, $state:1 };
            getBalance(account).then(function(balance) {
              act.balance = web3.fromWei(balance, "ether");
              return getEXRBalance (account);
            }).then(function(balance){
              act.exrBalance = web3.fromWei(balance, "ether");
              return isAccountUnlocked(account);
            }).then(function(isUnlocked){
              act.unlocked = isUnlocked;
              accounts.push(act);
              deferred.resolve(true);
            }).catch(function(error){
              handleError('refreshAccounts', error);
              deferred.reject(error);
            });
          });

          $q.all(promises).then(function(data){
            accounts = accounts.sort(function(a,b) { return  a.id - b.id; } ); 
            if(!angular.equals(exrUserData.accounts, accounts)) { 
              console.log('Updating Accounts...');
              exrUserData.accounts = accounts;
            }
            resolve(accounts);
          }).catch(function(error){ reject(error); });
        }
      });
    });
  };

	var getAccount = function(account) {
    return $q(function(resolve, reject) {
      var act = { id:1, address:account, balance:0, exrBalance:0, unlocked:false };
      getBalance(account).then(function(balance) {
        act.balance = web3.fromWei(balance, "ether");
        return getEXRBalance(account);
      }).then(function(balance){
        act.exrBalance = web3.fromWei(balance, "ether");
        return isAccountUnlocked(account);
      }).then(function(isUnlocked){
        act.unlocked = isUnlocked;
        resolve(act);
      }).catch(function(error){
        handleError('getAccount', error);
        reject(error);
      });
    });
  };
	
	var isAccountUnlocked = function(account){
    // There is currently no official way to check if an account is locked
		// This is a (hopefully temporary) hack to check if the account is unlocked, as it must be to sign
    return $q(function(resolve, reject) {
      web3.eth.sign(account, "0x0000000000000000000000000000000000000000000000000000000000000000", function(error, result){  
		    if(error) { 
          if(error.message.indexOf('authentication needed') !== -1){
            resolve(false);
          } else { 
            reject(error);
          }
        } else {
          resolve(true);
        }
    	});
    });
	};
  
  var unlockedCall = function(account, fn){
    console.log('unlocked call');
     isAccountUnlocked(account).then(function(isUnlocked){
      if(isUnlocked){
        fn();
      } else {
        $('#modal').modal({"backdrop": "static"});
        $('#modalPassword, #modalSend').show();
        $('#modalUpdate, #modalIgnore').hide();
        $('#modalYes, #modalNo').hide();
        $('#modalTitle').html("Account Locked");
        $('#modalDesc').html("The account " + account + " is currently locked. Please enter the password for this account to continue with this transaction.");
        $("#modalSend").off().on('click', function() { 
          $("#modal").modal("hide");
          var pw = $("#modalPassword").val();
          $("#modalPassword").val("");
          unlockAccount(account, pw, function(){ 
            fn();
          });
          $("#modalSend").off();
        });
        $('#modalPassword').focus(); 
      }
     }).catch(function(error){

     });
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
    if(conf === true) { 
      $('#modalTitle').html("Confirm Password for New Account");
      $('#modalDesc').html("Please confirm the password you selected by re-entering it below.");
    } else {
      $('#modalTitle').html("Create New Account");
      $('#modalDesc').html("Please enter a password for your new account.");
    }
    $("#modalSend").off().on('click', function(){
      $("#modal").modal("hide");
      var pw = $("#modalPassword").val();
      $("#modalPassword").val("");
      if(conf === true) {
        if(pw === confpw){
          web3.personal.newAccount(pw, function(error, result){
            if(!error) {
              growl.success("New account has succesfully been created.", {title:"Account Created.", ttl: -1}); 
              console.log("New account created.");
              refreshAccounts();
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

  var unlockAccount = function(account, pw, cb){ 
    web3.personal.unlockAccount(account, pw, 2, function(error, result){
      if(error) {
        growl.error("Could not unlock account: " + error, {title:"Could not unlock account.", ttl: -1}); 
        console.error("Could not Unlock account: " + error);
      } else {
        cb(result);
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
   var ev2 =  exrContract.allEvents({fromBlock: 600000, toBlock: $localStorage.lastEvent});
   ev2.get(function (error, results) {
    if (error) { 
      console.log("Event Read (2) Error: " + error); 
    } else {
      console.log("Rebuilding History...");
      $.each( results, function( index, result ) {
        addResultHistory(result, false); 
      });
    }
   });  
  };
  
  var addResultHistory = function(result, isFresh) {
    web3.eth.getAccounts(function(error, addressList){  
      if(error) {
        handleError('addResultHistory - getAccoounts: ', error);
      } else {
        var xObj = {};
        var xGrowl = {};
        xObj.block = result.blockNumber;
        if (typeof(result.args.exrId) != "undefined") xObj.exrId=result.args.exrId;
        blockToTimestamp(result.blockNumber).then(function(blockTime){
          xObj.blockTime = blockTime;
          switch(result.event){
            case "Buys":
              xObj.address = result.args.User;
              xObj.info = "EXR ID: " + result.args.exrId + " - Multiplier: " + result.args.Multiplier;
              xObj.type = "EXR Purchase";
              xGrowl.message="Your EXR purchased has been successfully recorded on the blockchain.";
              xGrowl.title = "EXR Purchase";
            break;
            case "RedeemCoupons":
              xObj.address = result.args.User;
              xObj.info = "EXR ID: "+result.args.exrId + " - Redemptions: "+result.args.Coupons+" - Amount: " + web3.fromWei(result.args.Amount) + " EXP";
              xObj.type = "Interest Redemption";
              xGrowl.message = "Your coupon(s) has been redeemed.";
              xGrowl.title = "Coupon Redemption";
            break;
            case "RedeemEXR":
              xObj.address = result.args.User;
              xObj.info = "EXR ID: "+result.args.exrId+" - Amount: " + web3.fromWei(result.args.Amount) + " EXP";
              xObj.type = "EXR Redemption";
              xGrowl.message = "Your EXR has been redeemed.";
              xGrowl.title = "EXR Redemption";
            break;
            case "Withdraws": 
              xObj.address = result.args.User;
              xObj.info = "Amount: " + web3.fromWei(result.args.Amount) + " EXP";
              xObj.type = "EXR Withdraw";
              xGrowl.message = "Your withdraw has been completed.";
              xGrowl.title = "EXR Contract Withdraw";
            break;
            case "Transfers": 
              var userIsFrom = false;
              $.each(exrUserData.exr, function(index,value){ if(value.id == result.args.exrId) { value.$state = 1; } });
              if(addressList.indexOf(result.args.TransferFrom) > -1) {
                xObj.address = result.args.TransferFrom;
                xObj.info = "EXR ID: " + result.args.exrId + " - Transferred to " + result.args.TransferTo.substring(0,16) + "...";
                xObj.type = "EXR Transfer Sent";
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
                xObj.info = "EXR ID: " + result.args.exrId + " - Transferred from " + result.args.TransferFrom.substring(0,16) + "...";
                xObj.type = "EXR Transfer Recv";
              }
              xGrowl.message = "Your transfer is complete and has been recorded on the blockchain."; 
              xGrowl.title = "EXR Transfer";
            break;
            case "Deposits":
              xObj.address = result.args.Sender;
              xObj.info = "Amount: " + web3.fromWei(result.args.Amount) + " EXP";
              xObj.type = "EXR Deposit";
              xGrowl.message = "Your deposit has been completed."; 
              xGrowl.title = "EXR Contract Deposit";
            break;  
          } 
          if(!$localStorage.history[xObj.address]) { $localStorage.history[xObj.address] = []; }
          if($.grep($localStorage.history[xObj.address], function( elm, indx ) {
            return ((JSON.stringify(elm) == JSON.stringify(xObj)) || (elm.tx == result.transactionHash));
          }).length<1) {
            $localStorage.history[xObj.address].push(xObj);  
            if(isFresh) growl.success(xGrowl.message, {title:xGrowl.title, ttl: -1});
        } else { console.log('Duplicate History Entry Found, Ignoring...'); }
        if($localStorage.pending[xObj.address]) $localStorage.pending[xObj.address] = $.grep($localStorage.pending[xObj.address], function( elm, indx ) { return elm.tx == result.transactionHash; }, true);
        });
      }
    });
  };
  
  var addPendingHistory = function(address, type, info, tx, exrId){
    var xObj = {};
    if(!$localStorage.pending[address]) $localStorage.pending[address] = [];
    if (exrId) xObj.exrId=exrId;
    xObj.address = address;
    xObj.type = type;
    xObj.info = info; 
    xObj.tx = tx;
    $localStorage.pending[address].push(xObj);
    console.log('pending exr tx [' + type + '] added to history, tx: ' + tx);
  };
 
  var watchHistory = function () {
    // we clear and rebuild history incase user added a new account, a more proper elegant solution next ver
    $localStorage.history = {};
    rebuildHistory(); 
    events = exrContract.allEvents({fromBlock: ($localStorage.lastEvent+1), toBlock: 'latest'}, function (error, result) {
      if (error) { 
        console.log("Event Read Error: " + error);  
      } else {
        $localStorage.lastEvent = result.blockNumber;
        web3.eth.getAccounts(function(error, addressList){ 
          if(
            addressList.indexOf(result.args.Sender) > -1
            || addressList.indexOf(result.args.User) > -1
            || addressList.indexOf(result.args.TransferFrom) > -1
            || addressList.indexOf(result.args.TransferTo) > -1
          ){
            if(result.blockNumber > $localStorage.lastBlock){ addResultHistory(result, true); }
          } else {
            // Event for an address not available in wallet, [TODO: Add handling for watching multisig and remote wallets]
          }
          if(result.blockNumber>lastEventBlock) { 
            $localStorage.lastBlock = lastEventBlock;
            lastEventBlock = result.blockNumber;
          }
        });
      }
    });
  };

  return {
    exrVars: exrVars,
    exrUserData: exrUserData,
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
    isAddressValid: isAddressValid,
    deposit: deposit,
    withdraw: withdraw,
    redeem: redeem,
    collect: collect,
    buyEXR: buyEXR,
    transfer: transfer,
    blockToRelativeTime: blockToRelativeTime,
    blockToTimestamp: blockToTimestamp,
  };
});
