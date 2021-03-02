const KamalToken = artifacts.require("KamalToken");

module.exports = function (deployer) {
  deployer.deploy(KamalToken);
};
