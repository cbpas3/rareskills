// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract CysAmazingPhotos is Ownable, ERC721 {
    using Counters for Counters.Counter;
    using BitMaps for BitMaps.BitMap;
    using Strings for uint256;

    string constant NFT_NAME = "CysAmazingPhotos";
    string constant NFT_SYMBOL = "CyAP";
    uint256 constant NUMBER_OF_NFTS = 10;
    uint256 private _mintPrice;
    string private baseURI;
    bytes32 public merkleRoot;
    bool uriRevealed = false;
    bool soldOut = false;
    mapping(uint256=>string) nickNames;
    Counters.Counter private _numberOfNFTsMinted;
    BitMaps.BitMap private claimTracker;
    enum States{ CLOSED, PRESALE, PUBLIC, SOLDOUT }
    States currentState;

    struct Commit {
    bytes32 commit;
    uint64 block;
    bool revealed;
  }

  struct TransferInput {
    address from;
    address to; 
    uint256 tokenId;
    bytes data;
  }

  mapping (address => Commit) public commits;
    

    constructor(uint256 mintPrice, string memory initialBaseUri) ERC721(NFT_NAME, NFT_SYMBOL){
        _mintPrice = mintPrice;
        baseURI = initialBaseUri;
        currentState = States.CLOSED;
    }


    
    // Mint related functions

    function _mintPresale(bytes32[] memory merkleProof, bytes32 leafToVerify, uint index) internal{
        require(
            MerkleProof.verify(
                merkleProof,
                merkleRoot,
                leafToVerify),
        "CysAmazingPhotos: Invalid merkle proof");
        require(getClaimStatus(index)==false, "CysAmazingPhotos: NFT already claimed.");
        _updateToClaimed(index);
        _numberOfNFTsMinted.increment();
        _mint(msg.sender, _numberOfNFTsMinted.current());
    }

    function mint(bytes32[] calldata merkleProof, bytes32 leafToVerify, uint index) external payable {
        require(msg.sender == tx.origin, "CysAmazingPhotos: Minter can't be a smart contract.");
        require(msg.value == _mintPrice, "CysAmazingPhotos: Not enough Ether.");
        if(currentState == States.PRESALE){
            _mintPresale(merkleProof, leafToVerify, index);
        }
        else if (currentState == States.PUBLIC){
            _numberOfNFTsMinted.increment();
            _mint(msg.sender, _numberOfNFTsMinted.current());
            if(_numberOfNFTsMinted.current() == NUMBER_OF_NFTS){
                //setState(States.SOLDOUT);
                currentState = States.SOLDOUT;
            }
        }
        else {
            revert("CysAmazingPhotos: Minting is closed.");
        }
    }

        function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Admin related functions

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function getBaseURI() external view returns (string memory) {
        return baseURI;
    }
    

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    /// Sends placeholder URI until the real one is revealed
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if(uriRevealed){
            super.tokenURI(tokenId);
        } else{
            _requireMinted(tokenId);
            
            return string(abi.encodePacked(_baseURI(), "0"));
        }   
    }

    function setMintPrice(uint256 _newPrice) external onlyOwner {
        _mintPrice = _newPrice;
    }

    function setState(States newState) public onlyOwner{
        /// 0: CLOSED, 1: PRESALE, 2: PUBLIC, 3: SOLDOUT
        if(newState == States.PRESALE){
            require(merkleRoot != 0, "CysAmazingPhotos: Merkle Root isn't set.");
        }
        currentState = newState;
    }

    

    // Nickname related functions

    function setNickname(uint256 tokenId, string calldata nickname) external {
        require(msg.sender == ownerOf(tokenId), "CysAmazingPhotos: Non-owner set nickname");
        require(bytes(nickname).length <= 20, "CysAmazingPhotos: Nickname too long. Should be 20 characters or less.");
        nickNames[tokenId] = nickname;
    }

    function getNickname(uint256 tokenId) external view returns(string memory nickname){
        nickname = nickNames[tokenId];
        return nickname;
    }

    // Whitelist related stuff

    function setMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
    }


    function _updateToClaimed(uint index) internal{
        claimTracker.set(index);
    }

    function _updateToUnclaimed(uint index) internal{
        claimTracker.unset(index);
    }

    function getClaimStatus(uint index) public returns(bool){
        return claimTracker.get(index);
    }

    // Commit-Reveal related functions

    event RevealHash(address sender, bytes32 revealHash, string officialURI);
    event CommitHash(address sender, bytes32 dataHash, uint64 block);

 
    function commit(bytes32 getHashOfHashOfOfficialBaseURI) public {
        commits[msg.sender].commit = getHashOfHashOfOfficialBaseURI;
        commits[msg.sender].block = uint64(block.number);
        commits[msg.sender].revealed = false;
        emit CommitHash(msg.sender,commits[msg.sender].commit,commits[msg.sender].block);
    }

    function reveal(string calldata officialBaseURI) public onlyOwner {
        require(currentState == States.SOLDOUT, "CysAmazingPhotos::reveal: Collection hasn't sold out yet.");
        //make sure it hasn't been revealed yet and set it to revealed
        require(commits[msg.sender].revealed==false,"CysAmazingPhotos::reveal: Already revealed");
        commits[msg.sender].revealed=true;
        //require that they can produce the committed hash
        require(getHash(keccak256(abi.encodePacked(officialBaseURI)))==commits[msg.sender].commit,"CysAmazingPhotos::reveal: Revealed hash does not match commit");
        //require that the block number is greater than the original block (Not needed because it collection needs to be sold out first)
        // require(uint64(block.number)>commits[msg.sender].block + 10,"CysAmazingPhotos::reveal: Not enough blocks have passed.");
        //get the hash of the block that happened after they committed
        setBaseURI(officialBaseURI);
        emit RevealHash(msg.sender,getHash(keccak256(abi.encodePacked(officialBaseURI))),officialBaseURI);
    }

    function getHash(bytes32 data) public view returns(bytes32){
        return keccak256(abi.encodePacked(address(this), data));
    }
    
    // Multi-transfer functions

    function multiTransfer(TransferInput[] calldata transfers) public {

        bytes memory transferBytecode;
        for(uint256 transferNumber = 0; transferNumber < transfers.length; transferNumber++){

            transferBytecode = abi.encodeWithSignature("safeTransferFrom(address,address,uint256,bytes)", transfers[transferNumber].from, transfers[transferNumber].to, transfers[transferNumber].tokenId, transfers[transferNumber].data);
            //console.logBytes(transferBytecode);
            (bool ok,) = address(this).delegatecall(transferBytecode);
            if (!ok) {
                revert("One transfer failed");
            }
        }
    } 

}

// 0x
// b88d4fde
// 00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8
// 0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc
// 0000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000080
// 0000000000000000000000000000000000000000000000000000000000000000