const { assert } = require('chai');
const { transformAsserterArgs } = require('chai-as-promised');

const MemoryToken = artifacts.require('./MemoryToken.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Memory Token', (accounts) => {
  let token;

  before(async () => {
    token = await MemoryToken.deployed();
  });

  describe('deployment', async () => {
    it('deploys successfully', async () => {

      const address = token.address;

      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
      
    });

    it('has a name', async () => {
      const name = await token.name();
      assert.equal(name, 'Memory Token');
    });

    it('has a symbol', async () => {
      const symbol = await token.symbol();
      assert.equal(symbol, 'MEMORY');
    });

  });

  describe('token distribution', async () => {
    it('mints tokens', async () => {
      let result;
      await token.mint(accounts[0], 'https://token-uri.com/nft');

      result = await token.totalSupply();
      assert.equal(result.toString(), 1, 'total supply is correct');

      result = await token.balanceOf(accounts[0]);
      assert.equal(result.toNumber(), 1, 'balnceOf is correct');
      
      result = await token.ownerOf(1);
      assert.equal(result.toString(), accounts[0], 'ownerOf is correct');

      // owner can see all tokens
      let balanceOf = await token.balanceOf(accounts[0]);
      let tokenIds = [];
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.tokenOfOwnerByIndex(accounts[0], i);
        tokenIds.push(id.toString());
      }
      let expected = ['1'];
      assert.equal(tokenIds.toString(), expected.toString(), 'tokenIds are correct');

      let tokenURI = await token.tokenURI('1');
      assert.equal(tokenURI, 'https://token-uri.com/nft')

    });
  });
});
