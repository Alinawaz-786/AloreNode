require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-solhint");

// require("hardhat-watcher");

module.exports = {
  // defaultNetwork: "rinkeby",
  networks: {
    hardhat: {},
    // rinkeby:{
    //   url: "https://rinkeby.infura.io/v3/4913daa7178a4c77823ddea002c39d00",
    //   accounts: ['21ece61053289747b70f0c236f8a76bcd13caf0e25be005502d78bc8290e70d6']
    // },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: ['21ece61053289747b70f0c236f8a76bcd13caf0e25be005502d78bc8290e70d6'],
    },
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
    ci: {
      tasks: ["clean", {command: "compile", params: {quiet: true}}, {
        command: "test",
        params: {noCompile: true, testFiles: ["testfile.ts"]}
      }],
    }
  },
  etherscan: {
    apiKey: "VTJJ86VD6ZKVE3WQBMRE1CGP7HUM4Z8KRC"             //testnet BANance
    // apiKey: "XIBRQWVBQ9965HWXU135TCB1HI6CRDJNWW"                //Rinby
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16"
      },{
        version: "0.5.17"
      },{
        version: "0.8.0"
      },{
        version: "0.8.1"
      },{
        version: "0.8.7"
      }
     
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
}