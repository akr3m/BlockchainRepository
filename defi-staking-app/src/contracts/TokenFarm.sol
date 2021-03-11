pragma solidity ^0.5.0;

import './DappToken.sol';
import './DaiToken.sol';

contract TokenFarm {

    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    address [] public stakers;

    constructor (DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // stakes token = deposit
    function stakeToken(uint _amount) public {
        require(_amount > 0, 'amount cannot be 0');

        // transfer mock dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // update staking balance
        stakingBalance[msg.sender] += _amount;

        // add users to stakers only if they haven't staked already
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // update staking status
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    // issue tokens = earn interest
    function issueToken() public {
        require(msg.sender == owner, 'caller must be the owner');

        for (uint i = 0; i < stakers.length; i++ ) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
            
        }
    }

    // unstake tokens = withdraw
    function unstakeToken() public {
        // fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // check that staking balance is not 0
        require(balance > 0, 'Staking balance cannot be 0');

        daiToken.transfer(msg.sender, balance);

        // reset staking balance
        stakingBalance[msg.sender] = 0;

        // update staking status
        isStaking[msg.sender] = false;
    }
}