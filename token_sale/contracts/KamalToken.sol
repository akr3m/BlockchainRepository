pragma solidity ^0.4.2;

contract KamalToken {

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    string public name;
    string public symbol;
    string public standard;
    
    // events
    event Transfer(
        address indexed _from,
        address indexed _to, 
        uint256 _value
    );


    // Constructor
    constructor (uint256 _totalSupply) public {
        totalSupply = _totalSupply;

        // allocate the inital supply
        balanceOf[msg.sender] = _totalSupply;

        name = 'Kamal';
        symbol = 'KML';
        standard = 'Kamal Token v1.0';
    }

    
    function transfer(address _to, uint256 _value) public payable returns (bool success) {
        // exception if account doesn't have enough
        require(balanceOf[msg.sender] >= _value);

        // transfer the balance
        balanceOf[_to] = _value;
        balanceOf[msg.sender] -= _value;

        // trigger transfer event
        emit Transfer(msg.sender, _to, _value);

        // return a boolean
        return true;
    } 
}