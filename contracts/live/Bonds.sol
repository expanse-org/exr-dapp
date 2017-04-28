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
  
  event Buys(address indexed User, uint indexed BondId, uint Multiplier, uint MaturityTime);
  event Deposits(address indexed Sender, uint Amount);
  event RedeemCoupons(address indexed User, uint indexed BondId, uint Coupons, uint Amount);
  event RedeemBonds(address indexed User, uint indexed BondId, uint Amount);
  event Transfers(address indexed TransferFrom, address indexed TransferTo);
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

  modifier mustOwnBond(uint _bondid){ if(bonds[_bondid].owner != msg.sender) throw; _; }
  modifier mustBeOwner(){ if(owner != msg.sender) throw; _; }
   
  function EBS(){ owner = msg.sender; }

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
  
  function transfer(uint _bondid, address _to) mustOwnBond(_bondid) returns(bool){
    bonds[_bondid].owner = _to;
    delete users[msg.sender].bonds[_bondid];
    users[_to].bonds.push(_bondid);
    Transfers(msg.sender, _to);
    return true;
  }
  
  function buy(uint _multiplier) returns(uint bondId){
    if(_multiplier < 1) _multiplier = 1;
    if(_multiplier > limitBonds-totalBonds) throw;
    uint cost = price * _multiplier;
    if(users[msg.sender].balance < cost) throw;
    users[msg.sender].balance -= cost;

    nBonds++;
    bondId = nBonds;
    totalBonds+=_multiplier;
    activeBonds+=_multiplier;

    bonds[bondId].active = true;
    bonds[bondId].owner = msg.sender;
    bonds[bondId].multiplier = _multiplier;
    bonds[bondId].maturityTime = block.timestamp + maturity;
	bonds[bondId].created = block.number;
    bonds[bondId].lastRedemption = block.number;
    bonds[bondId].nextRedemption = block.timestamp + period;
    bonds[bondId].couponsRemaining = maxCoupons;

    users[msg.sender].bonds.push(bondId);
    Buys(msg.sender, bondId, bonds[bondId].multiplier, bonds[bondId].maturityTime);
  }
  
  function redeemCoupon(uint _bondid) mustOwnBond(_bondid) returns(bool, uint, uint){
    if(bonds[_bondid].couponsRemaining < 1) throw;
    if(bonds[_bondid].nextRedemption > block.timestamp) throw;
    uint timePassed = block.timestamp - bonds[_bondid].nextRedemption - period;
    uint matureCoupons = timePassed / period;
    if(bonds[_bondid].couponsRemaining < matureCoupons) matureCoupons=bonds[_bondid].couponsRemaining;
    if(matureCoupons<1) throw;
    
    uint amount = bonds[_bondid].multiplier * matureCoupons;
    bonds[_bondid].couponsRemaining -= matureCoupons;
    bonds[_bondid].lastRedemption = block.number;
    bonds[_bondid].redemptionHistory.push(sHistory(block.number, amount, block.timestamp));

    users[msg.sender].balance += amount;
    RedeemCoupons(msg.sender, _bondid, matureCoupons, amount);
    return (true, matureCoupons, amount);
  }

  function redeemBond(uint _bondid) mustOwnBond(_bondid) returns(bool){
    if(bonds[_bondid].active != true) throw;
    if(block.timestamp < bonds[_bondid].maturityTime) throw;
    if(bonds[_bondid].couponsRemaining>0) redeemCoupon(_bondid);
    bonds[_bondid].active = false;
    uint amount = price * bonds[_bondid].multiplier;
    users[msg.sender].balance += amount;
    activeBonds -= bonds[_bondid].multiplier;
    RedeemBonds(msg.sender, _bondid, amount);
    return true;
  }

  /* Constant Functions */

  function getBalance(address _user) constant returns(uint){ return users[_user].balance; }

  function getBond(uint _bondid) constant returns(bool active, address owner, uint multiplier, uint maturityTime, uint lastRedemption, uint nextRedemption, uint created, uint couponsRemaining){
    active = bonds[_bondid].active;
    owner = bonds[_bondid].owner;
    multiplier = bonds[_bondid].multiplier;
    maturityTime = bonds[_bondid].maturityTime;
    lastRedemption = bonds[_bondid].lastRedemption;
    nextRedemption = bonds[_bondid].nextRedemption;
    created = bonds[_bondid].created;
    couponsRemaining = bonds[_bondid].couponsRemaining;
  }
  
  function getUser(address _addr) constant returns(bool exists, uint balance, uint[] bonds){
    exists = users[_addr].exists;
    balance = users[_addr].balance;
    bonds = users[_addr].bonds;
  }

  function getBondHistoryLength(uint _bondid) constant returns(uint){ return bonds[_bondid].redemptionHistory.length; }

  function getBondHistory(uint _bondid, uint _index) constant returns(uint block, uint amount){
    block = bonds[_bondid].redemptionHistory[_index].block;
    amount = bonds[_bondid].redemptionHistory[_index].amount;
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