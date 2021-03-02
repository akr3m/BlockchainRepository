var KamalToken = artifacts.require('./KamalToken.sol');

contract('KamalToken', function(accounts) {
    it('sets total supply upon deployment', function () {
        return KamalToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets totalSupply to 1,000,000');
        });
    });
});