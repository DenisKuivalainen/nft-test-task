const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config({path: "../../.env"});

module.exports = {
  networks: {
    dev: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
    },
    test: {
      provider: function () {
        return new HDWalletProvider({
          privateKeys: (process.env.PRIVATE_KEYS || "").split(","),
          providerOrUrl: `https://ropsten.infura.io/v3/${process.env.PROJECT_KEY}`,
        });
      },
      gas: 6000000,
      gasPrice: 25000000000,
      network_id: 3,
    },
  },

  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11",
    },
  },
};
