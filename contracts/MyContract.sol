// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string public name = "TestToken";  // Name of the token
    string public symbol = "TTK";      // Symbol of the token
    uint8 public decimals = 18;        // Decimals for the token
    uint256 public totalSupply;        // Total supply of the token
    mapping(address => uint256) public balanceOf;  // Balance mapping
    mapping(address => mapping(address => uint256)) public allowance;  // Allowance mapping

    // Constructor that accepts initial supply as argument
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));  // Adjust supply based on decimals
        balanceOf[msg.sender] = totalSupply;  // Assign total supply to the contract deployer
    }

    // Transfer function to move tokens from sender to recipient
    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;  // Deduct the amount from sender's balance
        balanceOf[recipient] += amount;   // Add the amount to recipient's balance

        return true;
    }
}
