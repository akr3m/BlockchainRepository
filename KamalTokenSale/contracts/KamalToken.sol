pragma solidity ^0.4.2;

contract KamalToken {

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    string public name;
    string public symbol;
    string public standard;

    mapping(address => mapping(address => uint256)) public allowance;
    
    // events
    event Transfer(
        address indexed _from,
        address indexed _to, 
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
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
        balanceOf[_to] += _value;
        balanceOf[msg.sender] -= _value;

        // trigger transfer event
        emit Transfer(msg.sender, _to, _value);

        // return a boolean
        return true;
    } 


    // delegated transfers

    function approve(address _spender, uint256 _value) public returns (bool success) {
        //handle the allowance
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // exception if from account doesn't have enough
        require(balanceOf[_from] >= _value);

        // exception if allowance is not enough
        require(allowance[_from][msg.sender] >= _value);

        // transfer the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // update the allowance
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
}