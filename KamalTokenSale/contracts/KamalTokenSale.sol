pragma solidity ^0.4.2;

import './KamalToken.sol';

contract KamalTokenSale {

    address admin;

    KamalToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(KamalToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;

        // provision some tokens to the contract
    }

    function multiply(uint _n1, uint _n2) internal pure returns (uint res) {
        require(_n2 == 0 || (res = _n1 * _n2) / _n2 == _n1);
    }

    // buying token
    function buyTokens(uint256 _numberOfTokens) public payable {
        // check if value is equal to tokens
        require(multiply(_numberOfTokens, tokenPrice) == msg.value);
        
        // require that enough tokens are present
        require(_numberOfTokens <= tokenContract.balanceOf(this));

        // require that transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        // trigger a sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // ending the token sale
    function endSale() public {
        require(msg.sender == admin);

        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

        admin.transfer(address(this).balance);
    }
}