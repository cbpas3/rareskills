// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
@title An upgradeable staking contract
@author Cyan B. Pascual
@notice This is a practice project to learn upgradeable contracts
@notice Manual set up before use includes adding contract to setApproval for all
@notice Manual set up also includes transferring the ERC20 tokens for contract's use
*/
contract SimpleStaking is Initializable, IERC721ReceiverUpgradeable, OwnableUpgradeable {


    address private constant _TOKEN_CONTRACT_ADDRESS = 0xd9145CCE52D386f254917e481eB44e9943F39138;
    address private constant _NFT_CONTRACT_ADDRESS = 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8;
    uint256 constant STAKE_RATE = 10;

    struct Stake {
        address owner;
        uint256 timeStaked;
    }

    // map staker address to stake details
    mapping (uint256 => Stake) public stakes;

    /// Contructor
    function initialize() public initializer{}

    function stake(uint256 tokenId) external {
        stakes[tokenId] = Stake(msg.sender, block.timestamp);
        IERC721Upgradeable(_NFT_CONTRACT_ADDRESS).safeTransferFrom(msg.sender, address(this), tokenId);
    }

    function unstake(uint256 tokenId) external {
        require(stakes[tokenId].owner == msg.sender);
        uint256 daysDiff = (block.timestamp - stakes[tokenId].timeStaked) / 60 / 60/ 24;
        uint256 amountOwed = STAKE_RATE * daysDiff;
        require(IERC20Upgradeable(_TOKEN_CONTRACT_ADDRESS).transfer(msg.sender, amountOwed), "SimpleStaking: Token transfer was unsuccessful");
        IERC721Upgradeable(_NFT_CONTRACT_ADDRESS).safeTransferFrom( address(this),msg.sender, tokenId);
    }

    function onERC721Received(
    address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4){
        return IERC721ReceiverUpgradeable.onERC721Received.selector;
    }


}