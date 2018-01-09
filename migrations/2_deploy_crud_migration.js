var Voting = artifacts.require("./UserCrud.sol");

// This migration takes care of deploying the smart contract to the blockchain
module.exports = function (deployer) {
    deployer.deploy(UserCrud);
};
