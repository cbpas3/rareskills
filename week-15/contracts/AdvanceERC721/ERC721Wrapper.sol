// SPDX-License Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ERC721Wrapper is IERC721Receiver, IERC1155Receiver {

    function onERC1155Received(address, address, uint256, uint256, bytes memory) public override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function onERC721Received(address, address, uint256, bytes memory) public override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // @dev for other contracts to verify what EIPs this contract supports or can accept
    function supportsInterface(bytes4 interfaceId) external view override returns (bool){
        bytes4 forERC721 = 0x80ac58cd;
        bytes4 forERC1155 = 0xd9b67a26;
        bytes4 forERC165 = 0x01ffc9a7;
        bool isSupported = (interfaceId == forERC721 || interfaceId == forERC1155 || interfaceId == forERC165);
        return isSupported;
    }
    
}