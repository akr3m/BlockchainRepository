var KamalToken = artifacts.require('./KamalToken.sol');

contract('KamalToken', function(accounts) {
    
    var tokenInstance;

    it('initializes contract with correct values', function() {
        return KamalToken.deployed().then(async function(instance) {
            tokenInstance = instance;
            
            assert.equal(await tokenInstance.name(), 'Kamal', 
                'contract values initialized correctly with token name');
            assert.equal(await tokenInstance.symbol(), 'KML', 
                'contract values initialized correctly with token symbol');
            assert.equal(await tokenInstance.standard(), 'Kamal Token v1.0', 
                'contract values initialized correctly with token standard');
        });
    });

    it('sets total supply upon deployment', function () {
        return KamalToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 
                'sets totalSupply to 1,000,000');
        })
    });

    it('admin balance allocated the initial supply', function() {
        return KamalToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000,
                'admin balance allocated the initial supply');
        });
    });

    it('transfers ownership', function() {
        return KamalToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >=0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success) {
            assert.equal(success, true, 'returns true boolean value upon transfer');
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'triggers Transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the sender');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the receiver');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transferred amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
        });
    });
});