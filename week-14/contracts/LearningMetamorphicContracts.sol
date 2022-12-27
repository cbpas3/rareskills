// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;


contract Factory{

    
    mapping(address => address) private _implementations;
    event Deployed(address _addr);

    function deploy(uint salt, bytes calldata bytecode) public {
        
        bytes memory _metamorphicCode = (hex"5860208158601c335a63aaf10f428752fa158151803b80938091923cf3");
        
        // determine the address of the metamorphic contract.
        address metamorphicContractAddress = _getMetamorphicContractAddress(salt, _metamorphicCode);

       
        bytes memory impInitCode = bytecode;
        address implementationContractAddress;

        /// Deploy the implementation contract
        /// impInitCode inside the inline assembly contains the position in memory
        /// of the data part of the bytes impInitCode. This includes the number of 
        /// bytes that it contains, which is located at where impInitCode is pointing
        /// to and the bytecode which is located at impInitCode + 0x20 which is why
        /// we add 0x20 in the first line.abi
        /// encodedSize gets its value from where impInitCode is pointing to because 
        /// that is the first part of the data part of the bytes impInitCode.
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

    /**
    * @dev Internal view function for calculating a metamorphic contract address
    * given a particular salt.
    */
    function _getMetamorphicContractAddress(
        uint256 salt,
        bytes memory metamorphicCode
        ) internal view returns (address) {

        // determine the address of the metamorphic contract.
        return address(
          uint160(                      // downcast to match the address type.
            uint256(                    // convert to uint to truncate upper digits.
              keccak256(                // compute the CREATE2 hash using 4 inputs.
                abi.encodePacked(       // pack all inputs to the hash together.
                  hex"ff",              // start with 0xff to distinguish from RLP.
                  address(this),        // this contract will be the caller.
                  salt,                 // pass in the supplied salt value.
                  keccak256(
                      abi.encodePacked(
                        metamorphicCode
                      )
                    )     // the init code hash.
                )
              )
            )
          )
        );
    }

    //those two functions are getting called by the metamorphic Contract
    function getImplementation() external view returns (address implementation) {
        return _implementations[msg.sender];
    }


    
}

contract Implementation1{
    string constant public name = "Implementation 1";

    function operation(uint256 input) external view returns(uint256){
        return input+2;
    }

    function kill() external {
      selfdestruct(payable(msg.sender));
    }
}

contract Implementation2{
    string constant public name = "Implementation 2";

    function operation(uint256 input) external view returns(uint256){
        return input*2;
    }

    function kill() external {
      selfdestruct(payable(msg.sender));
    }
}