// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract toBeCreated{
    uint256 magicNumber;
    constructor(uint _magicNumber){
        magicNumber = _magicNumber;
    }
}

contract LearningCreate2{
    event Deploy(address addr);
    
    function predictAddress(uint256 salt, uint256 magicNumber) public view returns(address) {
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            bytes32(salt),
            keccak256(toBeCreatedBytecode(magicNumber))
        )))));
        return predictedAddress;
    }

    function toBeCreatedBytecode(uint256 magicNumber) public view returns(bytes memory){
        bytes memory bytecode = type(toBeCreated).creationCode;
        return abi.encodePacked(bytecode,abi.encode(magicNumber));
    }

    function create2Contract(uint256 salt, uint256 magicNumber) external{
        toBeCreated createdContract = new toBeCreated{salt: bytes32(salt)}(magicNumber);
        emit Deploy(address(createdContract));
    }   
}