// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CysToken is Initializable, ERC20CappedUpgradeable, OwnableUpgradeable{


    
    function initialize(
        string memory name,
        string memory symbol,
        uint256 cap
        ) public initializer {
        __ERC20_init_unchained(name, symbol);
        __ERC20Capped_init_unchained(cap);
        __Ownable_init();
    }

    function mint() external payable {
        require(msg.value == 1 ether, "CysToken: Wrong amount of Eth sent.");
        _mint(msg.sender,1000*10**decimals());
    }

    function withdrawEth() external payable onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

}

