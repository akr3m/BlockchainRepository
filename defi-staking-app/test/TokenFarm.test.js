const { assert } = require('chai');

require('chai').use(require('chai-as-promised')).should();

const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

function tokens(n) {
    return web3.utils.toWei(n, 'Ether');
}

contract('TokenFarm', (accounts) => {
    let daiToken, dappToken, tokenFarm;
    let owner = accounts[0];
    let investor = accounts[1];

    before(async () => {
        // load contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        await dappToken.transfer(tokenFarm.address, tokens('1000000'));
        await daiToken.transfer(investor, tokens('100'), {from: owner });
    });

    describe('Mock Dai Deployment', async () => {

        it('has a name', async () => {
            let  name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token');
        });

    });

    describe('Dapp Token Deployment', async () => {

        it('has a name', async () => {
            let  name = await dappToken.name();
            assert.equal(name, 'DApp Token');
        });

    });

    describe('Token Farm Deployment', async () => {

        it('has a name', async () => {
            let  name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm');
        });

        it('contract has tokens', async () => {
            let  tokenFarmBalance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(tokenFarmBalance, tokens('1000000'));
        });

    });

    describe('farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result;

            // check investor balance before and after staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Mock Dai wallet balance correct before staking');

            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor });
            await tokenFarm.stakeToken(tokens('100'), {from: investor});

            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), 0, 'investor Mock Dai wallet balance correct after staking');

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock Dai wallet balance correct after staking');

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('100'), 'Staking balance correct after staking');

            result = await tokenFarm.isStaking(investor);
            assert.equal(result, true, 'Investor is staking');

            // issue tokens
            await tokenFarm.issueToken({from: owner});

            // check balance after token issued
            result = await dappToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'Correct amount of Dapp Tokens issued');

            // ensure only owner can issue tokens
            await tokenFarm.issueToken({from: investor}).should.be.rejected;

            // unstake the tokens
            await tokenFarm.unstakeToken({from: investor});

            // check results after unstaking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI Balance correct after staking');

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct afters taking');

            result = await tokenFarm.isStaking(investor);
            assert.equal(result, false, 'investor staking status correct after staking');

        });
    });

});