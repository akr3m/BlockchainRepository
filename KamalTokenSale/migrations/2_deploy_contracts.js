const KamalToken = artifacts.require("./KamalToken.sol");
const KamalTokenSale = artifacts.require("./KamalTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(KamalToken, 1000000).then(function () {
    // token price is 0.001 ETH
    let tokenPrice = 1000000000000000;
    return deployer.deploy(KamalTokenSale, KamalToken.address, tokenPrice);
  });
};
