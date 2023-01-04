// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

library ERC721Storage {

    struct DiamondStorage {
        string tokenName;
        string tokenSymbol;
        uint256 maxAmountOfTokens;
        bool tokenInitialized;

        mapping(uint256 => address) owners;
        mapping(address => uint256) balances;
        mapping(uint256 => address) tokenApprovals;
        mapping(address => mapping(address => bool)) operatorApprovals;
    }


    function diamondStorage() internal pure returns(DiamondStorage storage ds) {
        bytes32 storagePosition = keccak256("diamond.storage.ERC721");
        assembly {
            ds.slot := storagePosition
        }
    }
}

contract ERC721Facet {
    // function setDataA(bytes32 _dataA) external {
    //     ERC721Storage.DiamondStorage storage ds = ERC721Storage.diamondStorage();
        // ds.dataA = _dataA;
    // }

    // function getDataA() external view returns (bytes32) {
    //     return ERC721Storage.diamondStorage().dataA;
    // }
    
    function initializer(string calldata _tokenName, string calldata _tokenSymbol, uint256 _maxAmountOfTokens) public {
        ERC721Storage.DiamondStorage storage ds = ERC721Storage.diamondStorage();
        require(ds.tokenInitialized == false);
        ds.tokenName = _tokenName;
        ds.tokenSymbol = _tokenSymbol;
        ds.maxAmountOfTokens = _maxAmountOfTokens;
        ds.tokenInitialized = true;
    }

    function getTokenName() public view returns(string memory){
        ERC721Storage.DiamondStorage storage ds = ERC721Storage.diamondStorage();
        return ds.tokenName;
    }
}
