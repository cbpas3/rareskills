// SPDX-License Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ERC721Wrapper is ERC1155, IERC721Receiver {

    address immutable ERC721ContractAddress;

    constructor(address _ERC721ContractAddress){
        ERC721ContractAddress = _ERC721ContractAddress;
    }



    function onERC721Received(address, address, uint256, bytes memory) public override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // @dev for other contracts to verify what EIPs this contract supports or can accept
    function supportsInterface(bytes4 interfaceId) external view override returns (bool){
        bytes4 forERC721 = 0x80ac58cd;
        bytes4 forERC165 = 0x01ffc9a7;
        bool isSupported = (interfaceId == forERC721 ||  interfaceId == forERC165);
        return isSupported;
    }
    
}