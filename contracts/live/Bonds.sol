pragma solidity ^0.4.8;

contract EBSBlockTime {
    function getBlockTime(uint _block) public returns(uint);
}


contract EBSBeta {
  function getUser(address _addr) returns(bool exists, uint balance, uint[] bonds);
  function getBond(uint _bid) returns(bool active, address owner, uint multiplier, uint maturityBlock, uint lastRedemption);
  function getBondHistoryLength(uint _bid) returns(uint length);
  function getBondHistory(uint _bid, uint _index) returns(uint block, uint amount);
}


contract EBS {
  address public owner;                     // contract admin address
  uint public constant coupon = 1 ether;
  uint public constant price = 100 ether;	    	// 100 Expanse
  uint public constant maturity = 15768000;	// 6mo in seconds
  uint public constant period = 2628000;    // 1mo in seconds 
  uint public constant maxCoupons = maturity/period;
  uint public nBonds;           // bond index (number of total bonds)
  uint public activeBonds;      // active bond index
  uint public totalBonds;       // this number calculates total bonds * multipliers
  uint public limitBonds;       // max amount of bonds to be issued
  uint public nUBP;             // upgraded bond index
  EBSBeta ebsBetaContract = EBSBeta(0x88ACBc37b80Ea9f7692BaF3eb2390c8a34F02457);
  EBSBlockTime blockTime = EBSBlockTime(0x0f079dBC5DA4C5f5cb3F2b8F66C74AB2866aba2f);
  
  event Buys(address indexed User, uint indexed exrId, uint Multiplier, uint MaturityTime);
  event Deposits(address indexed Sender, uint Amount);
  event RedeemCoupons(address indexed User, uint indexed exrId, uint Coupons, uint Amount);
  event RedeemBonds(address indexed User, uint indexed exrId, uint Amount);
  event Transfers(address indexed TransferFrom, address indexed TransferTo, uint indexed exrId);
  event Withdraws(uint Amount, address indexed User);

  struct sBond {
    bool active; 				// is bond active or redeemed
    address owner;				// address of bond owner
    uint multiplier;			// if someone spends 10k they would get a bond with a 100x multiplier
    uint maturityTime;			// timestamp that allows wd of full amount of this bond
    uint lastRedemption;		// block number of last redemption
    uint nextRedemption;		// timestamp of next avail redemption
    uint created;				// block number of when bond was created
    uint couponsRemaining;		// amount of coupons unredeemed
    sHistory[] redemptionHistory;// a History (blockHeight, amount, timestamp) of each redemption
  }

  struct sUser {
      bool exists;
      uint balance;
      uint[] bonds;
      bool upgraded;
  }

  struct sHistory {
    uint block;
    uint amount;
    uint timestamp;
  }

  mapping(address=>sUser) public users;
  mapping(uint=>sBond) public bonds;

  modifier mustOwnBond(uint _exrId){ if(bonds[_exrId].owner != msg.sender) throw; _; }
  modifier mustBeOwner(){ if(owner != msg.sender) throw; _; }
   
  function EBS() payable { owner = msg.sender; }

  function() payable {
    if(msg.value < 1 ether) throw;
    deposit();
  }

  /* Bond Management Functions */

  function deposit() payable {
    if(msg.value < 1 ether) throw;
    users[msg.sender].exists = true;
    users[msg.sender].balance += msg.value;
    Deposits(msg.sender, msg.value);
  }
  
  function withdraw() returns(bool){
    uint userBalance = users[msg.sender].balance;
    if(this.balance < userBalance) throw;
    users[msg.sender].balance = 0;
    if(!msg.sender.send(userBalance)) throw;
    Withdraws(userBalance, msg.sender);
    return true;
  }
  
  function transfer(uint _exrId, address _to) mustOwnBond(_exrId) returns(bool){
    uint bIndex;
    for(uint i=0; i<users[msg.sender].bonds.length; i++){
      if(users[msg.sender].bonds[i] == _exrId){
        bIndex=i;
        break;
      }
    }
    delete users[msg.sender].bonds[bIndex];
    bonds[_exrId].owner = _to;
    users[_to].bonds.push(_exrId);
    if(users[_to].exists!=true) users[_to].exists=true;
    Transfers(msg.sender, _to, _exrId);
    return true;
  }
  
  function buy(uint _multiplier) returns(uint exrId){
    if(_multiplier < 1) _multiplier = 1;
    if(_multiplier > limitBonds-totalBonds) throw;
    uint cost = price * _multiplier;
    if(users[msg.sender].balance < cost) throw;
    users[msg.sender].balance -= cost;

    nBonds++;
    exrId = nBonds;
    totalBonds+=_multiplier;
    activeBonds+=_multiplier;

    bonds[exrId].active = true;
    bonds[exrId].owner = msg.sender;
    bonds[exrId].multiplier = _multiplier;
    bonds[exrId].maturityTime = block.timestamp + maturity;
	bonds[exrId].created = block.number;
    bonds[exrId].lastRedemption = block.number;
    bonds[exrId].nextRedemption = block.timestamp + period;
    bonds[exrId].couponsRemaining = maxCoupons;

    users[msg.sender].bonds.push(exrId);
    Buys(msg.sender, exrId, bonds[exrId].multiplier, bonds[exrId].maturityTime);
  }
  
  function redeemCoupon(uint _exrId) mustOwnBond(_exrId) returns(bool, uint, uint){
    if(bonds[_exrId].couponsRemaining < 1) throw;
    if(bonds[_exrId].nextRedemption > block.timestamp) throw;
    uint timePassed = block.timestamp - (bonds[_exrId].nextRedemption-period);
    if(timePassed < period) throw;
    uint remainder = timePassed % period;
    uint timePassedCorrected = timePassed - remainder;
    uint periods = timePassedCorrected / period;
    if(bonds[_exrId].couponsRemaining < periods) periods=bonds[_exrId].couponsRemaining;

    bonds[_exrId].nextRedemption += period*periods;
    bonds[_exrId].couponsRemaining -= periods;
    bonds[_exrId].lastRedemption = block.number;
    
    uint amount = (bonds[_exrId].multiplier * periods)*coupon;
    bonds[_exrId].redemptionHistory.push(sHistory(block.number, amount, block.timestamp));
    users[msg.sender].balance += amount;
    RedeemCoupons(msg.sender, _exrId, periods, amount);
    return (true, periods, amount);
  }

  function redeemBond(uint _exrId) mustOwnBond(_exrId) returns(bool){
    if(bonds[_exrId].active != true) throw;
    if(block.timestamp < bonds[_exrId].maturityTime) throw;
    if(bonds[_exrId].couponsRemaining>0) redeemCoupon(_exrId);
    bonds[_exrId].active = false;
    uint amount = price * bonds[_exrId].multiplier;
    users[msg.sender].balance += amount;
    activeBonds -= bonds[_exrId].multiplier;
    RedeemBonds(msg.sender, _exrId, amount);
    return true;
  }

  /* Constant Functions */

  function getBalance(address _user) constant returns(uint){ return users[_user].balance; }

  function getBond(uint _exrId) constant returns(bool active, address owner, uint multiplier, uint maturityTime, uint lastRedemption, uint nextRedemption, uint created, uint couponsRemaining){
    active = bonds[_exrId].active;
    owner = bonds[_exrId].owner;
    multiplier = bonds[_exrId].multiplier;
    maturityTime = bonds[_exrId].maturityTime;
    lastRedemption = bonds[_exrId].lastRedemption;
    nextRedemption = bonds[_exrId].nextRedemption;
    created = bonds[_exrId].created;
    couponsRemaining = bonds[_exrId].couponsRemaining;
  }
  
  function getUser(address _addr) constant returns(bool exists, uint balance, uint[] bonds){
    exists = users[_addr].exists;
    balance = users[_addr].balance;
    bonds = users[_addr].bonds;
  }

  function getBondHistoryLength(uint _exrId) constant returns(uint){ return bonds[_exrId].redemptionHistory.length; }

  function getBondHistory(uint _exrId, uint _index) constant returns(uint block, uint amount){
    block = bonds[_exrId].redemptionHistory[_index].block;
    amount = bonds[_exrId].redemptionHistory[_index].amount;
  }
  
  /* Administration Functions */
   
  function empty() mustBeOwner { if(!owner.send(this.balance)) throw; }

  function kill() mustBeOwner { selfdestruct(owner); }

  function changeOwner(address _newOwner) mustBeOwner { owner = _newOwner; }

  function increaseLimit(uint _limit) mustBeOwner { limitBonds+=_limit; }
  
  function upgradeBonds(uint _nSteps) mustBeOwner {
    uint nStop = nUBP + _nSteps;
	    while(nUBP < nStop){
        nUBP++;
        nBonds++;
        var(_active, _owner, _multiplier, _maturityTime, _lastRedemption) = ebsBetaContract.getBond(nUBP);
        var(_created, _value) = ebsBetaContract.getBondHistory(nUBP, 0);
        var(_exists, _balance, _bonds) = ebsBetaContract.getUser(_owner);
        bonds[nUBP].active = _active;
        bonds[nUBP].owner = _owner;
        bonds[nUBP].multiplier = _multiplier;
        bonds[nUBP].created  = _created;
        bonds[nUBP].maturityTime = blockTime.getBlockTime(_created) + maturity; 
        bonds[nUBP].nextRedemption = blockTime.getBlockTime(_created) + period;
        bonds[nUBP].couponsRemaining = maxCoupons;
        users[_owner].bonds.push(nUBP);
        users[_owner].exists = true;
        users[_owner].upgraded = true;
        users[_owner].balance = _balance;
        activeBonds += _multiplier;
	    }
	  totalBonds = activeBonds;
  }
}