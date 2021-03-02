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
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
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

    it('approves tokens for delegated transfers', function() {
        return KamalToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert.equal(success, true, 'token approval returns true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'triggers Approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the sender');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the receiver');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transferred amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance, 100, 'stores the allowance for delegated transfer');
        });
    });


    var fromAccount;
    var toAccount;
    var spendingAccount;

    it('handles delegated transfer', function() {
        return KamalToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            // ensure that fromAccount has some tokens from initial supply
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]}); 
        }).then(function(receipt) {
            // approve spending account
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(function(receipt) {
            // try spending more than sender's balance
            return tokenInstance.transferFrom(fromAccount,
                toAccount, 120, {from: spendingAccount});
        }).then(assert.fail).catch(async function(error) {
            assert(error.message.indexOf('revert') >= 0, 
                'cannot transfer value larger than balance');
            return await tokenInstance.transferFrom(fromAccount,
                toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch(function(error) {
            var errorMessageContainsRevert = false;
            try {
                errorMessageContainsRevert = Array.isArray(error.message) || (error.message.indexOf('revert') >= 0);
                assert.equal(errorMessageContainsRevert, true, 'cannot transfer value larger than approved');
            } catch (err) {
                assert.equal(errorMessageContainsRevert, true, 'cannot transfer value larger than approved');
            }
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount}); 
        }).then(function(success) {
            assert.equal(success, true, 'returns true');
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount}); 
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'triggers Transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[2], 'logs the sender');
            assert.equal(receipt.logs[0].args._to, accounts[3], 'logs the receiver');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transferred amount');

            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'deducts the amount from sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, 'adds the amount to receiving account');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
        })
    });

});