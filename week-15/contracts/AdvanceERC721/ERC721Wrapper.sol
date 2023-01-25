// SPDX-License Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./CysAmazingPhotos.sol";


contract ERC721Wrapper is ERC1155, IERC721Receiver, Ownable {

    address immutable ERC721ContractAddress;
    uint256 constant AMOUNT = 1;
    constructor(address _ERC721ContractAddress) ERC1155("https://ipfs.io/ipfs/Qmf26APXuuGWee6GYJLvkJ4ZDsASdb7DQtqrysY6jEQ5z5/{id}"){
        ERC721ContractAddress = _ERC721ContractAddress;       
    }

    function tradeIn(uint tokenId, bytes calldata data) public {
        CysAmazingPhotos(ERC721ContractAddress).delegateCall(abi.encodeWithSignature("safeTransferFrom(address,address,uint256,bytes)", msg.sender, address(this),tokenId, data))
        _mint(msg.sender, tokenId, AMOUNT, DEFAULT_MESSAGE);
    }

    function mint(address minter, uint256 id) external authorizedAddressesOnly {
        _mint(minter, id, AMOUNT, DEFAULT_MESSAGE);
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