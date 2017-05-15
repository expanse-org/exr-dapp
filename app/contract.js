var DevContract = {
    "abi": [ { "constant": false, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "redeemBond", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_limit", "type": "uint256" } ], "name": "increaseLimit", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "maturity", "outputs": [ { "name": "", "type": "uint256", "value": "1440" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "nUBP", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_bondid", "type": "uint256" }, { "name": "_index", "type": "uint256" } ], "name": "getBondHistory", "outputs": [ { "name": "block", "type": "uint256" }, { "name": "amount", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "redeemCoupon", "outputs": [ { "name": "", "type": "bool" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_nSteps", "type": "uint256" } ], "name": "upgradeBonds", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "coupon", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "bonds", "outputs": [ { "name": "active", "type": "bool", "value": true }, { "name": "owner", "type": "address", "value": "0x9e228b9dfef5aaa968330203df88745ef5280425" }, { "name": "multiplier", "type": "uint256", "value": "1" }, { "name": "maturityTime", "type": "uint256", "value": "1493700073" }, { "name": "lastRedemption", "type": "uint256", "value": "601810" }, { "name": "nextRedemption", "type": "uint256", "value": "1493698873" }, { "name": "created", "type": "uint256", "value": "601810" }, { "name": "couponsRemaining", "type": "uint256", "value": "6" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "getBondHistoryLength", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_addr", "type": "address" } ], "name": "getUser", "outputs": [ { "name": "exists", "type": "bool", "value": true }, { "name": "balance", "type": "uint256", "value": "8000000000000000000" }, { "name": "bonds", "type": "uint256[]", "value": [ "0" ] } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0xcf751ced133c8e56cc686b7ebd5d9b26369b950c" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "limitBonds", "outputs": [ { "name": "", "type": "uint256", "value": "100" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "price", "outputs": [ { "name": "", "type": "uint256", "value": "2000000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "changeOwner", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "users", "outputs": [ { "name": "exists", "type": "bool", "value": true }, { "name": "balance", "type": "uint256", "value": "0" }, { "name": "upgraded", "type": "bool", "value": false } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_bondid", "type": "uint256" }, { "name": "_to", "type": "address" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "nBonds", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "maxCoupons", "outputs": [ { "name": "", "type": "uint256", "value": "6" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "type": "function" }, { "constant": true, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "getBond", "outputs": [ { "name": "active", "type": "bool" }, { "name": "owner", "type": "address" }, { "name": "multiplier", "type": "uint256" }, { "name": "maturityTime", "type": "uint256" }, { "name": "lastRedemption", "type": "uint256" }, { "name": "nextRedemption", "type": "uint256" }, { "name": "created", "type": "uint256" }, { "name": "couponsRemaining", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_multiplier", "type": "uint256" } ], "name": "buy", "outputs": [ { "name": "bondId", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "activeBonds", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "period", "outputs": [ { "name": "", "type": "uint256", "value": "240" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalBonds", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "empty", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_user", "type": "address" } ], "name": "getBalance", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "inputs": [], "payable": true, "type": "constructor" }, { "payable": true, "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "User", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" }, { "indexed": false, "name": "Multiplier", "type": "uint256" }, { "indexed": false, "name": "MaturityTime", "type": "uint256" } ], "name": "Buys", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "Sender", "type": "address" }, { "indexed": false, "name": "Amount", "type": "uint256" } ], "name": "Deposits", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "User", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" }, { "indexed": false, "name": "Coupons", "type": "uint256" }, { "indexed": false, "name": "Amount", "type": "uint256" } ], "name": "RedeemCoupons", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "User", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" }, { "indexed": false, "name": "Amount", "type": "uint256" } ], "name": "RedeemBonds", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "TransferFrom", "type": "address" }, { "indexed": true, "name": "TransferTo", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" } ], "name": "Transfers", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "Amount", "type": "uint256" }, { "indexed": true, "name": "User", "type": "address" } ], "name": "Withdraws", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "Log", "type": "uint256" } ], "name": "Log", "type": "event" } ],
    "address": "0xdaa8B401A7034f7Ceb3a7b017C9F5dbf3Fb39E4A"
};

var Contract = {
    "abi": [ { "constant": false, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "redeemBond", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_limit", "type": "uint256" } ], "name": "increaseLimit", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "maturity", "outputs": [ { "name": "", "type": "uint256", "value": "1440" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "nUBP", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_bondid", "type": "uint256" }, { "name": "_index", "type": "uint256" } ], "name": "getBondHistory", "outputs": [ { "name": "block", "type": "uint256" }, { "name": "amount", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "redeemCoupon", "outputs": [ { "name": "", "type": "bool" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_nSteps", "type": "uint256" } ], "name": "upgradeBonds", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "coupon", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "bonds", "outputs": [ { "name": "active", "type": "bool", "value": true }, { "name": "owner", "type": "address", "value": "0x9e228b9dfef5aaa968330203df88745ef5280425" }, { "name": "multiplier", "type": "uint256", "value": "1" }, { "name": "maturityTime", "type": "uint256", "value": "1493700073" }, { "name": "lastRedemption", "type": "uint256", "value": "601810" }, { "name": "nextRedemption", "type": "uint256", "value": "1493698873" }, { "name": "created", "type": "uint256", "value": "601810" }, { "name": "couponsRemaining", "type": "uint256", "value": "6" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "getBondHistoryLength", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_addr", "type": "address" } ], "name": "getUser", "outputs": [ { "name": "exists", "type": "bool", "value": true }, { "name": "balance", "type": "uint256", "value": "8000000000000000000" }, { "name": "bonds", "type": "uint256[]", "value": [ "0" ] } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0xcf751ced133c8e56cc686b7ebd5d9b26369b950c" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "limitBonds", "outputs": [ { "name": "", "type": "uint256", "value": "100" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "price", "outputs": [ { "name": "", "type": "uint256", "value": "2000000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "changeOwner", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "users", "outputs": [ { "name": "exists", "type": "bool", "value": true }, { "name": "balance", "type": "uint256", "value": "0" }, { "name": "upgraded", "type": "bool", "value": false } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_bondid", "type": "uint256" }, { "name": "_to", "type": "address" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "nBonds", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "maxCoupons", "outputs": [ { "name": "", "type": "uint256", "value": "6" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "type": "function" }, { "constant": true, "inputs": [ { "name": "_bondid", "type": "uint256" } ], "name": "getBond", "outputs": [ { "name": "active", "type": "bool" }, { "name": "owner", "type": "address" }, { "name": "multiplier", "type": "uint256" }, { "name": "maturityTime", "type": "uint256" }, { "name": "lastRedemption", "type": "uint256" }, { "name": "nextRedemption", "type": "uint256" }, { "name": "created", "type": "uint256" }, { "name": "couponsRemaining", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_multiplier", "type": "uint256" } ], "name": "buy", "outputs": [ { "name": "bondId", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "activeBonds", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "period", "outputs": [ { "name": "", "type": "uint256", "value": "240" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalBonds", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "empty", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_user", "type": "address" } ], "name": "getBalance", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "inputs": [], "payable": true, "type": "constructor" }, { "payable": true, "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "User", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" }, { "indexed": false, "name": "Multiplier", "type": "uint256" }, { "indexed": false, "name": "MaturityTime", "type": "uint256" } ], "name": "Buys", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "Sender", "type": "address" }, { "indexed": false, "name": "Amount", "type": "uint256" } ], "name": "Deposits", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "User", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" }, { "indexed": false, "name": "Coupons", "type": "uint256" }, { "indexed": false, "name": "Amount", "type": "uint256" } ], "name": "RedeemCoupons", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "User", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" }, { "indexed": false, "name": "Amount", "type": "uint256" } ], "name": "RedeemBonds", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "TransferFrom", "type": "address" }, { "indexed": true, "name": "TransferTo", "type": "address" }, { "indexed": true, "name": "BondId", "type": "uint256" } ], "name": "Transfers", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "Amount", "type": "uint256" }, { "indexed": true, "name": "User", "type": "address" } ], "name": "Withdraws", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "Log", "type": "uint256" } ], "name": "Log", "type": "event" } ],
    "address": "0xdaa8B401A7034f7Ceb3a7b017C9F5dbf3Fb39E4A"
};

var versionContract = {
  "address": "0x53fc92479DA69893D33C96179B37aA26130f0D01",
  "abi": [ { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_newAddr", "type": "address" }, { "name": "_version", "type": "bytes32" }, { "name": "_abiVersion", "type": "bytes32" } ], "name": "upgradeContract", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "latestContract", "outputs": [ { "name": "location", "type": "address", "value": "0x" }, { "name": "version", "type": "bytes32", "value": "0x" }, { "name": "abiVersion", "type": "bytes32", "value": "0x" }, { "name": "timestamp", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "changeOwner", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "latestDApp", "outputs": [ { "name": "version", "type": "bytes32", "value": "0x" }, { "name": "priority", "type": "uint8", "value": "0" }, { "name": "timestamp", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_version", "type": "bytes32" }, { "name": "_priority", "type": "uint8" } ], "name": "upgradeDApp", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "latestNode", "outputs": [ { "name": "version", "type": "bytes32", "value": "0x" }, { "name": "priority", "type": "uint8", "value": "0" }, { "name": "timestamp", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_version", "type": "bytes32" }, { "name": "_priority", "type": "uint8" } ], "name": "upgradeNode", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "_newAddress", "type": "address" }, { "indexed": false, "name": "_version", "type": "bytes32" }, { "indexed": false, "name": "_abiVersion", "type": "bytes32" }, { "indexed": false, "name": "_timestamp", "type": "uint256" } ], "name": "UpgradedContract", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "_version", "type": "bytes32" }, { "indexed": false, "name": "_priority", "type": "uint8" }, { "indexed": false, "name": "_timestamp", "type": "uint256" } ], "name": "UpgradedDApp", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "_version", "type": "bytes32" }, { "indexed": false, "name": "_priority", "type": "uint8" }, { "indexed": false, "name": "_timestamp", "type": "uint256" } ], "name": "UpgradedNode", "type": "event" } ]
};