pragma solidity ^0.4.9;

contract blockTime {
    function getBlockTime(uint _block) public returns(uint){}
}


contract Bond {
  function getUser(address _addr) returns(bool exists, uint balance, uint[] bonds){}
  function getBond(uint _bid) returns(bool active, address owner, uint multiplier, uint maturityBlock, uint lastRedemption){}
  function getBondHistoryLength(uint _bid) returns(uint length){}
  function getBondHistory(uint _bid, uint _index) returns(uint block, uint amount){}
}


contract Bonds {

  // globals
  address   public  owner;
  address   public  lastContract;

  uint      public  coupon;    // 1 Expanse
  uint      public  price;     // 100 Expanse
  uint      public  maturity;  // 6m in seconds:
  uint      public  period;    // 1m in seconds: 

  uint      public  nBonds; // bond index
  uint      public  aBonds; // active bond index
  uint      public  totalBonds; // this number calculates total bonds * multipliers
  uint      public  limitBonds; // max amount of bonds to be issued
  uint      public  maxCoupons; // max amount of redeemable Coupons 

  uint      public  nUBP; // bond_id - create a loop that increases by 10 each time
  uint      public  nUserUpdateProgress; // number of users who have upgraded

  // events
  event Buys(address indexed User, uint indexed BondId, uint Multiplier, uint indexed MaturityBlock);
  event Redemptions(address indexed User, uint indexed BondId, uint indexed Amount);
  event Withdraws(uint Amount, address indexed User);
  event Transfers(address indexed TransferFrom, address indexed TransferTo);
  event Deposits(address indexed Sender, uint Amount);
  event UserUpgrade(address indexed User, address indexed OldContract, address indexed NewContract, bool Success);

  struct sBond {
    bool active; // is bond active or redeemed
    address owner; // address of bond owner
    uint multiplier; // if someone spends 10k they would get a bond with a 100x multiplier
    uint maturityTime; // timestamp that allows wd of full amount of this bond
    uint lastRedemption; // block number of last redemption
    uint nextRedemption; // timestamp of next avail redemption
	uint created; // block number of when bond was created
    uint couponsRemaining; // amount of coupons unredeemed
    History[] redemptionHistory; // a history (blockHeight, amount) of each redemption
  }

  struct User {
      bool exists;
      uint balance;
      uint[] bonds;
      bool upgraded;
  }

  struct History {
    uint block;
    uint amount;
  }

  mapping(address=>User) public users;
  mapping(uint=>sBond) public bonds;

  modifier mustOwnBond(uint bondId){
      if(bonds[bondId].owner != msg.sender) {
        throw;
      }else{
        _;
      }
  }
  
  modifier mustBeOwner (){
      if(owner != msg.sender){
        throw;
      }else{
        _;
      }
  }
   

//0x88ACBc37b80Ea9f7692BaF3eb2390c8a34F02457
  function Bonds(){
    owner = msg.sender;
    //get all these variables from the last contract

    limitBonds = 1000;
    maturity   = 262800*60;     //262800 convert to timestamp and fix maturity bug;
    period     = 43800*60;
    price      = 100;
    coupon     = 1;
    maxCoupons = 6;
    lastContract = 0;

    //add this contract to Storage Admins

  }

  //default function break;
  function(){
    if(msg.value > 1 ether){
      deposit();
    } else {
      throw;
    }
  }

  function deposit(){
      if(msg.value >= 1 ether){
        users[msg.sender].exists = true;
        users[msg.sender].balance+=msg.value;
        Deposits(msg.sender, msg.value);
      } else {
        throw;
      }
  }

  // users use this function to buy bonds
  function buy(uint _multiplier) returns(uint multiplier, uint remainder, uint bondId){
    if(_multiplier < 1){
      _multiplier = 1;
    }
    // make sure someone can still even buy a bond
    // the test contract is limited
    if(limitBonds < (limitBonds + _multiplier)){
      throw;
    }

    // calculate cost
    uint cost = price * _multiplier;

    //make sure the user has enough dolla dolla bills
    if(users[msg.sender].balance < cost ){
      throw;
    }

    //update balance first
    users[msg.sender].balance-=cost;

    //increment the bond index
    nBonds++;
    totalBonds+=_multiplier;
    aBonds+=_multiplier;

    //set bondid from new index
    bondId = nBonds;

    //set the bond data
    bonds[bondId].active = true;
    bonds[bondId].owner = msg.sender;
    bonds[bondId].multiplier = _multiplier;
    bonds[bondId].maturityTime = block.timestamp + maturity;
	bonds[bondId].created = block.number;
    bonds[bondId].lastRedemption = block.number;
    bonds[bondId].nextRedemption = block.timestamp + period;
    bonds[bondId].couponsRemaining = maxCoupons;

    // update the users balance with the remainder
    users[msg.sender].bonds.push(bondId);

    // trigger event so the world can see how awesome you are
    Buys(msg.sender, bondId, bonds[bondId].multiplier, bonds[bondId].maturityTime);
  }

  // users use this function to redeem their coupons
  function redeemCoupon(uint _bid) mustOwnBond(_bid) returns(bool, bool, uint){
    //make sure the bond is valid
    //check and see how many periods have passed
    //periods are 30.45 days
    //if periods>=1 update the last redemption and redemption history
    //update the users balance

    if(bonds[_bid].active != true){
      throw;
    }

      if(bonds[_bid].nextRedemption > block.timestamp){
        throw;
      }

      uint timePassed = block.timestamp - bonds[_bid].lastRedemption;
      uint remainder = timePassed % period;
      uint timePassedCorrected = timePassed - remainder;
      uint periods = timePassedCorrected / period;

      if(periods>bonds[_bid].couponsRemaining){
        periods=bonds[_bid].couponsRemaining;
      }

      bonds[_bid].couponsRemaining-=periods;

      uint amt = coupon*bonds[_bid].multiplier*periods;

      bonds[_bid].lastRedemption = block.timestamp;
      bonds[_bid].redemptionHistory.push(History(block.timestamp, amt));

      users[msg.sender].balance+=amt;
      Redemptions(msg.sender, _bid, amt);
    // try to redeem the bond automatically
    return (true, redeemBond(_bid), amt);
  }

  // redeem the bond once its past its maturity date
  function redeemBond(uint bondId) mustOwnBond(bondId) returns(bool){
    if(bonds[bondId].active == true){
      //check maturity date
      if(block.timestamp <= bonds[bondId].maturityTime){
        //kill interest earning
        bonds[bondId].active = false;
        //update the users balance
        uint amt = price*bonds[bondId].multiplier;
        users[msg.sender].balance+=amt;
        aBonds-=bonds[bondId].multiplier;
        Redemptions(msg.sender, bondId, amt);
        return true;
      }
    }
    return false;
  }

// the withdraw function withdraws a users entire balance.
  function withdraw() returns(bool){
    //set balance to new variable so we can clear their current balance
    //and prevent rentry attacks
    uint bal = users[msg.sender].balance;
    //update balance
    if(this.balance < bal){
      throw;
    }

    users[msg.sender].balance = 0;
    //send
    if(!msg.sender.send(bal)){
      throw;
    }
    Withdraws(bal, msg.sender);
    return true;
  }

  function transfer(uint _bid, address _to) mustOwnBond(_bid) returns(bool){
    bonds[_bid].owner = _to;
    delete users[msg.sender].bonds[_bid];
    users[_to].bonds.push(_bid);
    Transfers(msg.sender, _to);
    return true;
  }

  function getBalance(address _user) returns(uint balance){
    balance = users[_user].balance;
  }

  function getBond(uint _bid) returns(bool active, address owner, uint multiplier, uint maturityTime, uint lastRedemption, uint nextRedemption, uint created, uint couponsRemaining){
    active = bonds[_bid].active;
    owner = bonds[_bid].owner;
    multiplier = bonds[_bid].multiplier;
    maturityTime = bonds[_bid].maturityTime;
    lastRedemption = bonds[_bid].lastRedemption;
    nextRedemption = bonds[_bid].nextRedemption;
    created = bonds[_bid].created;
    couponsRemaining = bonds[_bid].couponsRemaining;
  }

  function empty() mustBeAdmin {
    if(owner == msg.sender){
      uint256 balance = this.balance;
      if(!owner.send(balance)) throw;
    }
  }

  function kill() mustBeAdmin {
		selfdestruct(owner);
    }
  }

  function changeOwner(address newOwner) mustBeAdmin {
      owner = newOwner;

  }

  function increaseLimit(uint _limit){
    if(owner == msg.sender){
      limitBonds+=_limit;
    }
  }

  function getUser(address _addr) returns(bool exists, uint balance, uint[] bonds){
    exists = users[_addr].exists;
    balance = users[_addr].balance;
    bonds = users[_addr].bonds;
  }

  function getBondHistoryLength(uint _bid) returns(uint length){
    length = bonds[_bid].redemptionHistory.length;
  }

  function getBondHistory(uint _bid, uint _index) returns(uint block, uint amount){
    block = bonds[_bid].redemptionHistory[_index].block;
    amount = bonds[_bid].redemptionHistory[_index].amount;
  }

  function upgradeUser(address _addr) returns(bool){ // dont let exploit to rebalance
    var(a, b, c) = Bond(lastContract).getUser(msg.sender);
    users[msg.sender].exists = a;
    users[msg.sender].balance = b;
    users[msg.sender].upgraded = true;
    UserUpgrade(msg.sender, lastContract, this, true);
    return true;
  }

  function upgradeBonds(uint _nSteps) returns(bool){
    if(owner != msg.sender){throw;}
	blockTime bT = blockTime(0xba8dc1a692093d8abd34e12aa05a4fe691121bb6);
	Bond ebs0 = Bond(0x038f160ad632409bfb18582241d9fd88c1a072ba);
    uint nStop = nUBP + _nSteps;
<<<<<<< HEAD
    while(nUBP < nStop){
        var(a,b,c,d,e) = ebs0.getBond(nUBP);
        var(x,y) = ebs0.getBondHistory(nUBP, 0);
        bonds[nUBP].active = a;
        bonds[nUBP].owner = b;
        bonds[nUBP].multiplier = c;
        bonds[nUBP].created  = x;
        bonds[nUBP].maturityTime = bT.getBlockTime(x) + maturity; 
        if(e!=x) bonds[nUBP].lastRedemption = e;
        var bondHistoryLen=ebs0.getBondHistoryLength(nUBP);
        bonds[nUBP].couponsRemaining = maxCoupons-bondHistoryLen+1;
        for (uint i = 1; i < bondHistoryLen; i++) {
            var(block,amount)= ebs0.getBondHistory(nUBP, i);
            bonds[nUBP].redemptionHistory.push(History(block,amount));
        }
        bonds[nUBP].nextRedemption = bT.getBlockTime(x) + period*bondHistoryLen;
        users[owner].bonds.push(nUBP);
        nUBP++;
=======

    while(nUBP < nStop && nUBP <= nBonds){
      //get old bond data
      //Bond(lastContract).bonds[nUBP].
      //set in new mapping
      var(a,b,c,d,e,f,g) = Bond(lastContract).bonds(nUBP);

      bonds[nUBP].active = a;
      bonds[nUBP].owner = b;
      bonds[nUBP].multiplier = c;

      //double maturity block to fix from 3 months to 6 months
      //(((maturityBlock+131400) - this.block.number) * 60 ) + this.block.timestamp
      bonds[nUBP].maturityTime = (((d+131400)-block.number)*60)+block.timestamp;

      //this.block.time - ((this.block.number - lastRedemptionBlock) * 60)
      bonds[nUBP].lastRedemption = block.timestamp - ((block.number - e)*60);
      bonds[nUBP].nextRedemption = bonds[nUBP].lastRedemption + period;

      bonds[nUBP].couponsRemaining = g;
      //bonds[nUBP].redemptionHistory = Last.bonds[nUBP].redemptionHistory;

      nUBP++;
>>>>>>> 887a459abe2a1c1793b87bdaae574ef449b899d6
    }
    return true;
  }
}