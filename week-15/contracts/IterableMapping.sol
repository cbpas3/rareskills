// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

contract IterableMappping{
    mapping (address => uint256) records;
    mapping (address => bool) isInserted;
    address[] recordedAddresses;
    mapping (address => uint256) indices;

    function insert(address addressToBeInserted) external {
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