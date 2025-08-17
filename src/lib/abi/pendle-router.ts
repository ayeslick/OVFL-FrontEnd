export const PENDLE_ROUTER_ABI = [
  {
    "type": "function",
    "name": "swapExactTokenForPt",
    "stateMutability": "payable",
    "inputs": [
      { "type": "address", "name": "receiver" },
      { "type": "address", "name": "market" },
      { "type": "uint256", "name": "minPtOut" },
      { "type": "tuple", "name": "guessPtOut", "components": [
        { "type": "uint256", "name": "guessMin" },
        { "type": "uint256", "name": "guessMax" },
        { "type": "uint256", "name": "guessOffchain" },
        { "type": "uint256", "name": "maxIteration" },
        { "type": "uint256", "name": "eps" }
      ]},
      { "type": "tuple", "name": "input", "components": [
        { "type": "address", "name": "tokenIn" },
        { "type": "uint256", "name": "netTokenIn" },
        { "type": "address", "name": "tokenMintSy" },
        { "type": "address", "name": "bulk" },
        { "type": "address", "name": "pendleSwap" },
        { "type": "tuple", "name": "swapData", "components": [
          { "type": "uint8", "name": "swapType" },
          { "type": "address", "name": "extRouter" },
          { "type": "bytes", "name": "extCalldata" },
          { "type": "bool", "name": "needScale" }
        ]}
      ]},
      { "type": "tuple", "name": "limit", "components": [
        { "type": "uint256", "name": "limitRouter" },
        { "type": "uint256", "name": "normalFills" },
        { "type": "tuple[]", "name": "flashFills", "components": [
          { "type": "uint256", "name": "order" },
          { "type": "uint256", "name": "fillAmount" }
        ]},
        { "type": "bytes", "name": "optData" }
      ]}
    ],
    "outputs": [
      { "type": "uint256", "name": "netPtOut" },
      { "type": "uint256", "name": "netSyFee" },
      { "type": "uint256", "name": "netSyInterm" }
    ]
  }
] as const