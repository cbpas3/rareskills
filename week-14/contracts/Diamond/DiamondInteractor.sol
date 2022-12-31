// SPDX-License-Identifier: MIT

pragma solidity 0.8.1;

import "./Diamond.sol";
import {LibDiamond} from "./libraries/DiamondLib.sol";
import {IDiamondLoupe} from "./interfaces/IDiamondLoupe.sol";
import {IDiamondCut} from "./interfaces/IDiamondCut.sol";

contract DiamondInteractor{
    Diamond immutable diamondContract;
    constructor(address diamondAddress){
        diamondContract = Diamond(payable(diamondAddress));
    }

    function addFacet(
        IDiamondCut.FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata) external{
        (bool success, bytes memory data) = address(diamondContract).delegatecall(
            abi.encodeWithSignature("diamondCut((address,uint8,bytes4[])[],address,bytes)", _diamondCut, _init, _calldata)
        );
    }

    function facets() external returns(IDiamondLoupe.Facet[] memory facets_){
        (bool success, bytes memory data) = address(diamondContract).call(
            abi.encodeWithSignature("facets()")
        );
        
        facets_ = abi.decode(data, (IDiamondLoupe.Facet[]));
        return facets_;
    }

    function sayHello() external returns(string memory _greeting){
        (bool success, bytes memory data) = address(diamondContract).call(
            abi.encodeWithSignature("facets()")
        );

        _greeting = abi.decode(data, (string));
        return _greeting;
                
    }


}
