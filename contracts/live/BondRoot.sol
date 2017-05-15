pragma solidity ^0.4.8;

contract EBSVersion {
  address owner;
  enum ePriority { critical, urgent, important, normal, trivial }
  
  struct ContractHistory {
    address location;
    bytes32 version;
    bytes32 abiVersion;
    uint timestamp;
  }
  
  struct appHistory {
    bytes32 version;
    ePriority priority;
    uint timestamp;
  }
  
  ContractHistory[] ebsHistory;
  appHistory[] ebsDAppHistory;
  appHistory[] ebsNodeHistory;
  
  modifier mustBeOwner(){ if(owner != msg.sender) throw; _; } 
  
  event UpgradedContract(address _newAddress, bytes32 _version, bytes32 _abiVersion, uint _timestamp);
  event UpgradedDApp(bytes32 _version, ePriority _priority, uint _timestamp);
  event UpgradedNode(bytes32 _version, ePriority _priority, uint _timestamp);
  
  function EBSVersion() { owner = msg.sender; }
  
  function upgradeContract(address _newAddr, bytes32 _version, bytes32 _abiVersion) public mustBeOwner returns (bool) {
    ebsHistory.push(ContractHistory(_newAddr, _version, _abiVersion, now));
    UpgradedContract(_newAddr, _version, _abiVersion, now);
    return true;
  }
  
  function upgradeDApp(bytes32 _version, ePriority _priority) public mustBeOwner returns (bool) {
    ebsDAppHistory.push(appHistory(_version, _priority, now));
    UpgradedDApp(_version, _priority, now);
    return true;
  }
  
  function upgradeNode(bytes32 _version, ePriority _priority) public mustBeOwner returns (bool) {
    ebsNodeHistory.push(appHistory(_version, _priority, now));
    UpgradedNode(_version, _priority, now);
    return true;
  }
  
  function latestContract() public constant returns (address location, bytes32 version, bytes32 abiVersion, uint timestamp) {
    uint len = ebsHistory.length - 1;
    return(ebsHistory[len].location, ebsHistory[len].version, ebsHistory[len].abiVersion, ebsHistory[len].timestamp);
  }
  
  function latestDApp() public constant returns (bytes32 version, ePriority priority, uint timestamp) {
    uint len = ebsDAppHistory.length - 1;
    return(ebsDAppHistory[len].version, ebsDAppHistory[len].priority, ebsDAppHistory[len].timestamp);
  }
  
  function latestNode() public constant returns (bytes32 version, ePriority priority, uint timestamp) {
    uint len = ebsNodeHistory.length - 1;
    return(ebsNodeHistory[len].version, ebsNodeHistory[len].priority, ebsNodeHistory[len].timestamp);
  }
  
  function kill() mustBeOwner { selfdestruct(owner); }
  
  function changeOwner(address _newOwner) mustBeOwner { owner = _newOwner; }

}