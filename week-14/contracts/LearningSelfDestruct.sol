// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract LearningSelfDestruct {

    constructor() payable{}
    
    function kill() public {
        selfdestruct(payable(msg.sender));
    }

    function getBalance() public view returns(uint256){
        return address(this).balance;
    }
}

contract balanceChecker{
    function getBalance() public view returns(uint256){
        return msg.sender.balance;
    }
}