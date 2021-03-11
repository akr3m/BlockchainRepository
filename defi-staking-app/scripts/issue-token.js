const TokenFarm = artifacts.require('TokenFarm');

module.exports = async function(callback) {
    let tokenFarm = await TokenFarm.deployed();
    await tokenFarm.issueToken();
    // code here
    console.log('tokens issued!');

    callback();
}