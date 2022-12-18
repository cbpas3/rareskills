// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;


import "@openzeppelin/contracts/proxy/Clones.sol";
import "./CysToken.sol";

contract ERC20CloneFactory {
    address immutable tokenImplementation;

    constructor() {
        tokenImplementation = address(new CysToken());
    }

    function createToken(string calldata name, string calldata symbol, uint256 initialSupply) external returns(address){
        address clone = Clones.clone(tokenImplementation);
        CysToken(clone).initialize(name,symbol,initialSupply);
        return(clone);
    }
}
