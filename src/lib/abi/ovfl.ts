export const OVFL_ABI = [
  {
    "type": "constructor",
    "name": "",
    "stateMutability": "",
    "constant": false,
    "inputs": [
      { "type": "address", "name": "admin", "simpleType": "address" },
      { "type": "address", "name": "treasury", "simpleType": "address" }
    ],
    "id": "0ff1802f-a0e0-400d-8f0e-ac6136e060f6"
  },
  {
    "type": "function",
    "name": "pendleOracle",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "address", "name": "", "simpleType": "address" }],
    "id": "0xf32abc29"
  },
  {
    "type": "function",
    "name": "getRoleAdmin",
    "stateMutability": "view",
    "constant": false,
    "inputs": [{ "type": "bytes32", "name": "role", "simpleType": "bytes" }],
    "outputs": [{ "type": "bytes32", "name": "", "simpleType": "bytes" }],
    "id": "0x248a9ca3"
  },
  {
    "type": "function",
    "name": "checkTWAPCompatibility",
    "stateMutability": "view",
    "constant": false,
    "inputs": [
      { "type": "address", "name": "market", "simpleType": "address" },
      { "type": "uint32", "name": "twapDuration", "simpleType": "uint" }
    ],
    "outputs": [
      { "type": "bool", "name": "isSupported", "simpleType": "bool" },
      { "type": "bool", "name": "needsCardinalityIncrease", "simpleType": "bool" },
      { "type": "bool", "name": "hasEnoughData", "simpleType": "bool" },
      { "type": "uint16", "name": "cardinalityRequired", "simpleType": "uint" }
    ],
    "id": "0x10bbcff4"
  },
  {
    "type": "function",
    "name": "MIN_DELAY_SECONDS",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0x0445be7b"
  },
  {
    "type": "function",
    "name": "WSTETH",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "address", "name": "", "simpleType": "address" }],
    "id": "0xd9fb643a"
  },
  {
    "type": "function",
    "name": "settleMarket",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [{ "type": "address", "name": "market", "simpleType": "address" }],
    "id": "0x622a10ea"
  },
  {
    "type": "function",
    "name": "ovflETH",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "address", "name": "", "simpleType": "address" }],
    "id": "0x3e728e96"
  },
  {
    "type": "function",
    "name": "DEFAULT_ADMIN_ROLE",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "bytes32", "name": "", "simpleType": "bytes" }],
    "id": "0xa217fddf"
  },
  {
    "type": "function",
    "name": "sablierLL",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "address", "name": "", "simpleType": "address" }],
    "id": "0x94cd301a"
  },
  {
    "type": "function",
    "name": "executeSetTimelockDelay",
    "stateMutability": "nonpayable",
    "constant": false,
    "id": "0xcc73aa63"
  },
  {
    "type": "function",
    "name": "wrap",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [
      { "type": "uint256", "name": "amount", "simpleType": "uint" },
      { "type": "address", "name": "to", "simpleType": "address" }
    ],
    "id": "0x13bac820"
  },
  {
    "type": "function",
    "name": "approvedMarketsCount",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xc6da9457"
  },
  {
    "type": "function",
    "name": "pendingMarkets",
    "stateMutability": "view",
    "constant": false,
    "inputs": [{ "type": "address", "name": "", "simpleType": "address" }],
    "outputs": [
      { "type": "bool", "name": "queued", "simpleType": "bool" },
      { "type": "uint32", "name": "twapDuration", "simpleType": "uint" },
      { "type": "uint256", "name": "eta", "simpleType": "uint" }
    ],
    "id": "0x460bf7e1"
  },
  {
    "type": "function",
    "name": "settledAsset",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xf9c93eb9"
  },
  {
    "type": "function",
    "name": "MIN_PT_AMOUNT",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xb330cc12"
  },
  {
    "type": "function",
    "name": "series",
    "stateMutability": "view",
    "constant": false,
    "inputs": [{ "type": "address", "name": "", "simpleType": "address" }],
    "outputs": [
      { "type": "bool", "name": "approved", "simpleType": "bool" },
      { "type": "bool", "name": "settled", "simpleType": "bool" },
      { "type": "uint32", "name": "twapDurationFixed", "simpleType": "uint" },
      { "type": "uint256", "name": "ptBalance", "simpleType": "uint" },
      { "type": "uint256", "name": "expiryCached", "simpleType": "uint" }
    ],
    "id": "0x02a4b63d"
  },
  {
    "type": "function",
    "name": "FEE_MAX_BPS",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0x19a6ccc9"
  },
  {
    "type": "function",
    "name": "hasRole",
    "stateMutability": "view",
    "constant": false,
    "inputs": [
      { "type": "bytes32", "name": "role", "simpleType": "bytes" },
      { "type": "address", "name": "account", "simpleType": "address" }
    ],
    "outputs": [{ "type": "bool", "name": "", "simpleType": "bool" }],
    "id": "0x91d14854"
  },
  {
    "type": "function",
    "name": "setFee",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [{ "type": "uint16", "name": "newFeeBps", "simpleType": "uint" }],
    "id": "0x8e005553"
  },
  {
    "type": "function",
    "name": "previewRate",
    "stateMutability": "view",
    "constant": false,
    "inputs": [{ "type": "address", "name": "market", "simpleType": "address" }],
    "outputs": [{ "type": "uint256", "name": "rateE18", "simpleType": "uint" }],
    "id": "0xf6d23eca"
  },
  {
    "type": "function",
    "name": "grantRole",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [
      { "type": "bytes32", "name": "role", "simpleType": "bytes" },
      { "type": "address", "name": "account", "simpleType": "address" }
    ],
    "id": "0x2f2ff15d"
  },
  {
    "type": "function",
    "name": "executeAddMarket",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [{ "type": "address", "name": "market", "simpleType": "address" }],
    "id": "0xb033737a"
  },
  {
    "type": "function",
    "name": "BASIS_POINTS",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xe1f1c4a7"
  },
  {
    "type": "function",
    "name": "feeBps",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint16", "name": "", "simpleType": "uint" }],
    "id": "0x24a9d853"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "stateMutability": "view",
    "constant": false,
    "inputs": [{ "type": "bytes4", "name": "interfaceId", "simpleType": "bytes" }],
    "outputs": [{ "type": "bool", "name": "", "simpleType": "bool" }],
    "id": "0x01ffc9a7"
  },
  {
    "type": "function",
    "name": "claimable",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xaf38d757"
  },
  {
    "type": "function",
    "name": "renounceRole",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [
      { "type": "bytes32", "name": "role", "simpleType": "bytes" },
      { "type": "address", "name": "account", "simpleType": "address" }
    ],
    "id": "0x36568abe"
  },
  {
    "type": "function",
    "name": "MIN_TWAP_DURATION",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xd4ae6fe2"
  },
  {
    "type": "function",
    "name": "timelockDelaySeconds",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xad40a844"
  },
  {
    "type": "function",
    "name": "previewStream",
    "stateMutability": "view",
    "constant": false,
    "inputs": [
      { "type": "address", "name": "market", "simpleType": "address" },
      { "type": "uint256", "name": "ptAmount", "simpleType": "uint" }
    ],
    "outputs": [
      { "type": "uint256", "name": "toUser", "simpleType": "uint" },
      { "type": "uint256", "name": "toStream", "simpleType": "uint" },
      { "type": "uint256", "name": "rateE18", "simpleType": "uint" }
    ],
    "id": "0x61ebcb81"
  },
  {
    "type": "function",
    "name": "revokeRole",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [
      { "type": "bytes32", "name": "role", "simpleType": "bytes" },
      { "type": "address", "name": "account", "simpleType": "address" }
    ],
    "id": "0xd547741f"
  },
  {
    "type": "function",
    "name": "MAX_TWAP_DURATION",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xc8c4acec"
  },
  {
    "type": "function",
    "name": "deposit",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [
      { "type": "address", "name": "market", "simpleType": "address" },
      { "type": "uint256", "name": "ptAmount", "simpleType": "uint" }
    ],
    "outputs": [
      { "type": "uint256", "name": "toUser", "simpleType": "uint" },
      { "type": "uint256", "name": "toStream", "simpleType": "uint" },
      { "type": "uint256", "name": "streamId", "simpleType": "uint" }
    ],
    "id": "0x47e7ef24"
  },
  {
    "type": "function",
    "name": "pendingDelay",
    "stateMutability": "view",
    "constant": false,
    "outputs": [
      { "type": "bool", "name": "queued", "simpleType": "bool" },
      { "type": "uint256", "name": "newDelay", "simpleType": "uint" },
      { "type": "uint256", "name": "eta", "simpleType": "uint" }
    ],
    "id": "0x4ca8f0ed"
  },
  {
    "type": "function",
    "name": "MAX_DELAY_SECONDS",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0x06467b32"
  },
  {
    "type": "function",
    "name": "totalClaimed",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "uint256", "name": "", "simpleType": "uint" }],
    "id": "0xd54ad2a1"
  },
  {
    "type": "function",
    "name": "queueAddMarket",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [
      { "type": "address", "name": "market", "simpleType": "address" },
      { "type": "uint32", "name": "twapSeconds", "simpleType": "uint" }
    ],
    "id": "0x56a75a4b"
  },
  {
    "type": "function",
    "name": "queueSetTimelockDelay",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [{ "type": "uint256", "name": "newDelay", "simpleType": "uint" }],
    "id": "0x761e564f"
  },
  {
    "type": "function",
    "name": "claim",
    "stateMutability": "nonpayable",
    "constant": false,
    "inputs": [{ "type": "uint256", "name": "amount", "simpleType": "uint" }],
    "id": "0x379607f5"
  },
  {
    "type": "function",
    "name": "getApprovedMarkets",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "address[]", "name": "", "simpleType": "slice", "nestedType": { "type": "address" } }],
    "id": "0x686126e0"
  },
  {
    "type": "function",
    "name": "ADMIN_ROLE",
    "stateMutability": "view",
    "constant": false,
    "outputs": [{ "type": "bytes32", "name": "", "simpleType": "bytes" }],
    "id": "0x75b238fc"
  }
] as const