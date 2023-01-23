// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./CysAmazingPhotos.sol";


contract SampleMinter{

    function tryToMint(address ERC721ContractAddress) external{
        bytes32[] memory merkleProof;
        bytes32 user;
        CysAmazingPhotos(ERC721ContractAddress).mint(merkleProof, user,0);
    }

}