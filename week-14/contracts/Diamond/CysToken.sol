// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract CysToken is ERC20Capped{
    address payable private _admin;

    modifier onlyAdmin {
      require(msg.sender == _admin, "CysToken: Not authorized to call this function.");
      _;
    }
    
    constructor() ERC20Capped(200) ERC20("CysToken", "CYT") {
        _admin = payable(msg.sender);
    }

    function mint() external payable {
        if(totalSupply() == cap()){
            require(balanceOf(address(this))>= 1, "CysToken: Insuffienct tokens in contract.");
            _transfer( address(this) ,msg.sender,1);
        } else{
            _mint(msg.sender,1);
        } 
    }

    function withdrawEth() external payable onlyAdmin {
        _admin.transfer(address(this).balance);
    }

    function refund() external payable {
        require(address(this).balance >= 5*10**(decimals()-1), "CysToken: Not enough ether to pay.");
        require(balanceOf(msg.sender) >= 1000 * 10**decimals());
        _transfer(msg.sender, address(this) ,1000 * 10**decimals());
        payable(msg.sender).transfer(5*10**(decimals()-1));
    }
}