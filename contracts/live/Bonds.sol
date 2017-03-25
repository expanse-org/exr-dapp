pragma solidity ^0.4.9;

contract Bond {
  // globals
  address   public  owner;
  address   public  lastContract;

  uint      public  coupon;    // 1 Expanse
  uint      public  price;     // 100 Expanse
  uint      public  maturity;  // 1 yr in blocks
  uint      public  period;    // 31.45 days

  uint      public  nBonds; // bond index
  uint      public  aBonds; // active bond index
  uint      public  totalBonds; // this number calculates total bonds * multipliers
  uint      public  limitBonds; // TODO: limit to 1000
  uint      public  maxCoupons;

  uint      public  nUBP; // bond_id - create a loop that increases by 10 each time
  uint      public  nUserUpdateProgress; // number of users who have upgraded

  // events
  event Buys(address indexed User, uint indexed BondId, uint Multiplier, uint indexed MaturityBlock);
  event Redemptions(address indexed User, uint indexed BondId, uint indexed Amount);
  event Withdraws(uint Amount, address indexed User);
  event Transfers(address indexed TransferFrom, address indexed TransferTo);
  event Deposits(address indexed Sender, uint Amount);
  event BondMultipliers(bytes8 indexed Change, uint indexed BondId);
  event UserUpgrade(address indexed User, address indexed OldContract, address indexed NewContract, bool Success);

  struct sBond {
    bool active;
    address owner;
    // if someone spends 10k they would get a bond with a 100x multiplier
    uint multiplier;
    // the block that allows the person to wd the full amount of this bond
    uint maturityBlock;
    // the last time a coupon was recieved
    uint lastRedemption;
    // the last time the multiplier has been edited
    uint lastMultiplierChange;
    uint couponsRemaining;
    // a history of each redemption
    // block height and amount
    History[] redemptionHistory;
  }

  struct User {
      bool exists;
      uint balance;
      uint[] bonds;
  }

  struct History {
    uint block;
    uint amount;
  }

  mapping(address=>User) public users;
  mapping(uint=>sBond) public bonds;

  modifier mustBeOwner(uint bondId){
      if(bonds[bondId].owner != msg.sender) {
        throw;
      }else{
        _;
      }
  }

  //function Bond(address _lastContract, address _storageContract){}
  //default function break;
  function(){}
  function deposit(){}
  // users use this function to buy bonds
  function buy(uint _multiplier) returns(uint multiplier, uint remainder, uint bondId){}
  // users use this function to redeem their coupons
  function redeemCoupon(uint _bid) mustBeOwner(_bid) returns(bool, bool, uint){}
  // redeem the bond once its past its maturity date
  function redeemBond(uint bondId) mustBeOwner(bondId) returns(bool){}
  // the withdraw function withdraws a users entire balance.
  function withdraw() returns(bool){}
  function transfer(uint _bid, address _to) mustBeOwner(_bid) returns(bool){}
  function getBalance(address _user) returns(uint balance){}
  function getBond(uint _bid) returns(bool active, address owner, uint multiplier, uint maturityBlock, uint lastRedemption){}
  function empty(){}
  function changeOwner(address newOwner) {}
  function increaseLimit(uint _limit){}
  function getUser(address _addr) returns(bool exists, uint balance, uint[] bonds){}
  function getBondHistoryLength(uint _bid) returns(uint length){}
  function getBondHistory(uint _bid, uint _index) returns(uint block, uint amount){}
  function upgradeUser() returns(bool){}
  function upgradeBonds(uint _nSteps) returns(bool){}

}


contract Bonds {

    // globals
  address   public  owner;
  address   public  lastContract;

  uint      public  coupon;    // 1 Expanse
  uint      public  price;     // 100 Expanse
  uint      public  maturity;  // 1 yr in blocks
  uint      public  period;    // 31.45 days

  uint      public  nBonds; // bond index
  uint      public  aBonds; // active bond index
  uint      public  totalBonds; // this number calculates total bonds * multipliers
  uint      public  limitBonds; // TODO: limit to 1000
  uint      public  maxCoupons;

  uint      public  nUBP; // bond_id - create a loop that increases by 10 each time
  uint      public  nUserUpdateProgress; // number of users who have upgraded

  // events
  event Buys(address indexed User, uint indexed BondId, uint Multiplier, uint indexed MaturityBlock);
  event Redemptions(address indexed User, uint indexed BondId, uint indexed Amount);
  event Withdraws(uint Amount, address indexed User);
  event Transfers(address indexed TransferFrom, address indexed TransferTo);
  event Deposits(address indexed Sender, uint Amount);
  event BondMultipliers(bytes8 indexed Change, uint indexed BondId);
  event UserUpgrade(address indexed User, address indexed OldContract, address indexed NewContract, bool Success);

  struct sBond {
    bool active;
    address owner;
    // if someone spends 10k they would get a bond with a 100x multiplier
    uint multiplier;
    // the block that allows the person to wd the full amount of this bond
    uint maturityBlock;
    // the last time a coupon was recieved
    uint lastRedemption;
    // the last time the multiplier has been edited
    uint lastMultiplierChange;
    uint couponsRemaining;
    // a history of each redemption
    // block height and amount
    History[] redemptionHistory;
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

  modifier mustBeOwner(uint bondId){
      if(bonds[bondId].owner != msg.sender) {
        throw;
      }else{
        _;
      }
  }

//0x88ACBc37b80Ea9f7692BaF3eb2390c8a34F02457
  function Bonds(address _lastContract){
    owner = msg.sender;
    //get all these variables from the last contract

    limitBonds = Bond(_lastContract).limitBonds();        //1000;
    maturity   = Bond(_lastContract).maturity();     //131400;
    period     = Bond(_lastContract).period();       //43800;
    price      = Bond(_lastContract).price();        //100 ether;
    coupon     = Bond(_lastContract).coupon();       //1 ether;
    maxCoupons = Bond(_lastContract).maxCoupons();
    lastContract = _lastContract;

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
    if(limitBonds < (1*multiplier)){
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

    //set the bond
    bonds[bondId].active = true;
    bonds[bondId].owner = msg.sender;
    bonds[bondId].multiplier = _multiplier;
    bonds[bondId].maturityBlock = block.number + maturity;
    bonds[bondId].lastRedemption = block.number;
    bonds[bondId].lastMultiplierChange = block.number;
    bonds[bondId].couponsRemaining = maxCoupons;
    bonds[bondId].redemptionHistory.push(History(block.number, 0));

    // update the users balance with the remainder
    users[msg.sender].bonds.push(bondId);

    // trigger event so the world can see how awesome you are
    Buys(msg.sender, bondId, bonds[bondId].multiplier, bonds[bondId].maturityBlock);
  }

  // users use this function to redeem their coupons
  function redeemCoupon(uint _bid) mustBeOwner(_bid) returns(bool, bool, uint){
    //make sure the bond is valid
    //check and see how many periods have passed
    //periods are 30.45 days
    //if periods>=1 update the last redemption and redemption history
    //update the users balance

    if(bonds[_bid].active != true){
      throw;
    }
      uint timePassed = block.number - bonds[_bid].lastRedemption;

      if(timePassed < period){
        throw;
      }

      uint remainder = timePassed % period;
      uint timePassedCorrected = timePassed - remainder;
      uint periods = timePassedCorrected / period;

      if(periods>bonds[_bid].couponsRemaining){
        periods=bonds[_bid].couponsRemaining;
      }

      bonds[_bid].couponsRemaining-=periods;

      uint amt = coupon*bonds[_bid].multiplier*periods;

      bonds[_bid].lastRedemption = block.number;
      bonds[_bid].redemptionHistory.push(History(block.number, amt));

      bonds[_bid].couponsRemaining+=periods;
      users[msg.sender].balance+=amt;
      Redemptions(msg.sender, _bid, amt);
    // try to redeem the bond automatically
    return (true, redeemBond(_bid), amt);
  }

  // redeem the bond once its past its maturity date
  function redeemBond(uint bondId) mustBeOwner(bondId) returns(bool){
    if(bonds[bondId].active == true){
      //check maturity date
      if(block.number >= bonds[bondId].maturityBlock){
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

  function transfer(uint _bid, address _to) mustBeOwner(_bid) returns(bool){
    bonds[_bid].owner = _to;
    users[_to].bonds.push(_bid);
    Transfers(msg.sender, _to);
    return true;
  }

  function getBalance(address _user) returns(uint balance){
    balance = users[_user].balance;
  }

  function getBond(uint _bid) returns(bool active, address owner, uint multiplier, uint maturityBlock, uint lastRedemption){
    active = bonds[_bid].active;
    owner = bonds[_bid].owner;
    multiplier = bonds[_bid].multiplier;
    maturityBlock = bonds[_bid].maturityBlock;
    lastRedemption = bonds[_bid].lastRedemption;
  }

  function empty() {
    if(owner == msg.sender){
      uint256 balance = this.balance;
      if(!owner.send(balance)) throw;
    }
  }

  function changeOwner(address newOwner) {
    if(owner == msg.sender){
      owner = newOwner;
    }
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

  function upgradeUser() returns(bool){
    //check and see if the user already upgrade
    //get old users balance
    //set balance of new user
    //update user "upgraded status"

    var(a, b, c) = Bond(lastContract).getUser(msg.sender);

    users[msg.sender].exists = a;
    users[msg.sender].balance = b;

    uint n;

    //users[msg.sender].bonds = c;

    users[msg.sender].upgraded = true;

    UserUpgrade(msg.sender, lastContract, this, true);
    return true;
  }

  function upgradeBonds(uint _nSteps) returns(bool){
    if(owner != msg.sender){throw;}
    //start bond id = nUBP
    //end bond id nUBP + 10

    uint nStop = nUBP + _nSteps;

    while(nUBP < nStop && nUBP <= nBonds){
      //get old bond data
      //Bond(lastContract).bonds[nUBP].
      //set in new mapping
      var(a,b,c,d,e,f,g) = Bond(lastContract).bonds(nUBP);

      bonds[nUBP].active = a;
      bonds[nUBP].owner = b;
      bonds[nUBP].multiplier = c;
      bonds[nUBP].maturityBlock = d;
      bonds[nUBP].lastRedemption = e;
      bonds[nUBP].lastMultiplierChange = f;
      bonds[nUBP].couponsRemaining = g;
      //bonds[nUBP].redemptionHistory = Last.bonds[nUBP].redemptionHistory;

      nUBP++;
    }

    return true;

  }

}
