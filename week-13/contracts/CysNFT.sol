// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;


import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract SimpleNFTv2 is ERC721Upgradeable, OwnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIds;


    address private _TOKENCONTRACTADDRESS;
    uint256 public constant MAX_SUPPLY = 10;
    string public baseURI;
    uint256 public mintPrice;

    function initialize(string memory _name, string memory _symbol, address _tokenContractAddress, uint256 _mintPrice) public initializer {
        __ERC721_init(_name, _symbol);
        __Ownable_init();
        _TOKENCONTRACTADDRESS = _tokenContractAddress;
        mintPrice = _mintPrice;
    }

    function mint() external payable {
        require(_tokenIds.current() <= MAX_SUPPLY, "SimpleNFT: Supply limit reached.");
        // require(msg.value == PRICE, "SimpleNFT: Not enough Ether.");
        _tokenIds.increment();
        _mint(msg.sender, _tokenIds.current());
        require(IERC20(_TOKENCONTRACTADDRESS).balanceOf(msg.sender) >= mintPrice, "SimpleNFT: Not enough Ether.");
        require(IERC20(_TOKENCONTRACTADDRESS).transferFrom(msg.sender,address(this), mintPrice),"SimpleNFT: Tranfer was unsuccessful");
    }

    function viewBalance() external view returns (uint256){
        return balanceOf(msg.sender);
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
        mintPrice = _newPrice;
    }

}