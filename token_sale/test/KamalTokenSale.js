var KamalToken = artifacts.require('./KamalToken.sol');
var KamalTokenSale = artifacts.require('./KamalTokenSale.sol');

contract('KamalTokenSale', function(accounts) {
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var tokenPrice = 1000000000000000; // in wei
    var buyer = accounts[1];
    var numberOfTokens = 10;
    var tokensAvailale = 750000;

    it('initializes contract with correct values', function() {
        return KamalTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address; 
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function (price) {
            assert.equal(price, tokenPrice, 'token price is correct');
        })
    });

    it('facilitates token buying', function() {
        return KamalToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return KamalTokenSale.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance;
            //provision tokens to tokenSaleContract 
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailale, {from: admin});
        }).then(function(receipt) {
            var value = numberOfTokens * tokenPrice;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: value});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'should trigger one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should trigger Sell event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the amount of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens,
                'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'bought correct amount of tokens');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailale - numberOfTokens, 'bought correct amount of tokens');
            // try to buy tokens that are different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 100});
        }).then(assert.fail).catch(function(error) {
            let transactionReverted = false;
            try {
                transactionReverted = Array.isArray(error.message) || (error.message.indexOf('revert') >= 0);
                assert.equal(transactionReverted, true, 'msg.value must equal number of tokens in wei * token price');
            } catch (err) {
                console.log('inside catch block');
                assert.equal(transactionReverted, true, 'msg.value must equal number of tokens in wei * token price');
            }
            return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >=0, 'cannot buy more tokens than available');
        });

    });
});