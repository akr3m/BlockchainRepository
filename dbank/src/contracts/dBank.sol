// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";

contract dBank {

  //assign Token contract to variable
  Token private token;

  //add mappings
  mapping(address => uint) public etherBalanceOf;
  mapping(address => uint) public depositStart;
  mapping(address => bool) public isDeposited;

  //add events
  event Deposit(address indexed _user, uint _amount, uint _timestamp);
  event Withdraw(address indexed _user, uint _amount, uint _timestamp, uint _interest);

  //pass as constructor argument deployed Token contract
  constructor(Token _token) public {
    //assign token deployed contract to variable
    token = _token;
  }

  function deposit() payable public {
    //check if msg.sender didn't already deposited funds
    require(isDeposited[msg.sender] == false, 'Error, deposity already active');

    //check if msg.value is >= than 0.01 ETH
    require(msg.value >= 1e16, 'Error, deposit must be greater than 0.01 ETH');

    //increase msg.sender ether deposit balance
    etherBalanceOf[msg.sender] += msg.value;

    //start msg.sender holding time
    depositStart[msg.sender] += block.timestamp;

    //set msg.sender deposit status to true
    isDeposited[msg.sender] = true;

    //emit Deposit event
    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  function withdraw() public {
    //check if msg.sender deposit status is true
    require(isDeposited[msg.sender] == true, 'Error, no deposit found');

    //assign msg.sender ether deposit balance to variable for event
    uint userBalance = etherBalanceOf[msg.sender];

    //check user's hold time
    uint depositTime = block.timestamp - depositStart[msg.sender];

    //calc interest per second
    // 1 yr = 365.25 days / yr * 24 hours / day * 3600 seconds / hr = 31557600 seconds
    // minimum balance = 0.01 ETH = 1e16 Wei
    // interest = 10%
    // interest per seconds = 10% * 1e16 / 31557600 = 31688088
    uint interestPerSecond = 31688088 * (userBalance / 1e16);
    uint interest = interestPerSecond * depositTime;

    //send eth to user
    msg.sender.transfer(userBalance);

    //send interest in tokens to user
    token.mint(msg.sender, interest);

    //reset depositer data
    etherBalanceOf[msg.sender] = 0;
    depositStart[msg.sender] = 0;
    isDeposited[msg.sender] = false;

    //emit event
    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }

  function borrow() payable public {
    //check if collateral is >= than 0.01 ETH
    //check if user doesn't have active loan

    //add msg.value to ether collateral

    //calc tokens amount to mint, 50% of msg.value

    //mint&send tokens to user

    //activate borrower's loan status

    //emit event
  }

  function payOff() public {
    //check if loan is active
    //transfer tokens from user back to the contract

    //calc fee

    //send user's collateral minus fee

    //reset borrower's data

    //emit event
  }
}