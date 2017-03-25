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

  struct Bond {
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
  mapping(uint=>Bond) public bonds;

  modifier mustBeOwner(uint bondId){
      if(bonds[bondId].owner != msg.sender) {
        throw;
      }else{
        _
      }
  }

  function Bond(address _lastContract, address _storageContract){}
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
  function empty() mustBeContractOwner(){}
  function changeOwner(address newOwner) {}
  function increaseLimit(uint _limit){}
  function getUser(address _addr) returns(bool exists, uint balance, uint[] bonds){}
  function getBondHistoryLength(uint _bid) returns(uint length){}
  function getBondHistory(uint _bid, uint _index) returns(uint block, uint amount){}
  function upgradeUser() returns(bool){}
  function upgradeBonds(uint _nSteps) mustBeContractOwner() returns(bool){}

}
