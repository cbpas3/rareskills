// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

/// @title An implementation of iterable mapping
/// @notice Contract can allow devs to iterate through its records
/// @dev Iterate through records by iterating through recordedAddresses array
contract IterableMappping{
    /// @notice One address is associated with one uint256
    mapping (address => uint256) records;
    /// @notice To keep track if a given address is on record
    mapping (address => bool) isInserted;
    /// @notice Keeps track of addresses in the mapping and allows iterability
    address[] recordedAddresses;
    /// @notice Keeps track of each address' index in `recordAddresses`
    mapping (address => uint256) indices;

    function insert(address addressToBeInserted) external {
        /// @notice if address given is already given then does nothing
        if(isInserted[addressToBeInserted]){
            return();
        }
        else{
            isInserted[addressToBeInserted] = true;
            recordedAddresses.push(addressToBeInserted);
            indices[addressToBeInserted] = recordedAddresses.length -1;
            return();
        }
    }
    
    function setRecord(address addressOfConcern, uint256 record) external{
        require(isInserted[addressOfConcern], "Address not on record");
        records[addressOfConcern] = record;
    }

    function getRecord(address addressOfConcern) external view returns(uint256){
        require(isInserted[addressOfConcern], "Address not on record");
        return records[addressOfConcern];
    }

    function deleteRecord(address addressToBeDeleted) external {
        require(isInserted[addressToBeDeleted], "Address not on record");
        recordedAddresses[indices[addressToBeDeleted]] = recordedAddresses[recordedAddresses.length - 1];
        recordedAddresses.pop();
        delete isInserted[addressToBeDeleted];
        delete indices[addressToBeDeleted];
        delete records[addressToBeDeleted];
        
    }



    function getNumberOfRecords() external view returns(uint256){
        return recordedAddresses.length;
    }
}