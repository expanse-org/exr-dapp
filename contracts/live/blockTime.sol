pragma solidity ^0.4.0;
// Block-Time Contract used to reference block timestamps during upgrade as
// solidity cannot access timestamps of past blocks
contract blockTime {

	address public owner;
	mapping (uint => uint) mBlockTimes;

	modifier onlyOwner { 
		if (msg.sender == owner)  {
			_; 
		} else {
			throw;
		}
	}
	function changeOwner(address newOwner) onlyOwner() {
			owner = newOwner;
	}
	
	function blockTime() {
        owner = msg.sender;
    }
	
    function addBlockTime (uint _block, uint _timestamp) onlyOwner() public {
        mBlockTimes[_block]=_timestamp;
    }

    function getBlockTime(uint _block) public returns(uint){
        return mBlockTimes[_block];
    }
	
	function () {
        throw; 
    }
	
	function empty() onlyOwner() {
		uint256 balance = this.balance;
		if(!owner.send(balance)) throw;
	}
}