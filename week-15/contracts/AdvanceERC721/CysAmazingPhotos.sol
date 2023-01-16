// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 
import "@openzeppelin/contracts/utils/Counters.sol";

contract CysAmazingPhotos is Ownable, ERC721 {
    using Counters for Counters.Counter;

    string constant NFT_NAME = "CysAmazingPhotos";
    string constant NFT_SYMBOL = "CyAP";
    uint256 private _mintPrice;
    string private baseURI;
    Counters.Counter private _numberOfNFTsMinted;
    enum States{ PRESALE, PUBLIC, SOLDOUT }
    States currentState;
    

    constructor(uint256 mintPrice, string memory initialBaseUri) ERC721(NFT_NAME, NFT_SYMBOL){
        _mintPrice = mintPrice;
        baseURI = initialBaseUri;
    }

    function _mintPresale() internal payable{
        
    }

    function mint() external payable {
        require(msg.value == _mintPrice, "CysAmazingPhotos: Not enough Ether.");
        if (PRE)
        _numberOfNFTsMinted.increment();
        _mint(msg.sender, _numberOfNFTsMinted.current());
    }


    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    function setMintPrice(uint256 _newPrice) external onlyOwner {
        _mintPrice = _newPrice;
    }

}