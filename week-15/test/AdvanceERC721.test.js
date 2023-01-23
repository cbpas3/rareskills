const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

const {
  getMerkleProof,
  getMerkleRoot,
} = require("../tools/merkleTreeGenerator");

describe("AdvanceERC721", function () {
  let ERC721Contract,
    SampleMinterContract,
    masterCopy,
    deployer,
    buyer1,
    buyer2,
    buyer3,
    buyer4,
    buyers,
    whitelist,
    walletFactory;

  beforeEach(async function () {
    /// Deploy a brand new contract before each test
    [deployer, buyer1, buyer2, buyer3, buyer4] = await ethers.getSigners();
    whitelist = [buyer1.address, buyer2.address, buyer3.address];
    buyers = [buyer1, buyer2, buyer3, buyer4];
    const ERC721ContractFactory = await ethers.getContractFactory(
      "CysAmazingPhotos"
    );

    masterCopy = await (
      await ethers.getContractFactory("GnosisSafe", deployer)
    ).deploy();

    walletFactory = await (
      await ethers.getContractFactory("GnosisSafeProxyFactory", deployer)
    ).deploy();

    let mintPrice = ethers.utils.parseEther("0.01");
    // placeholder URI
    const baseURI = "ipfs://QmQVBhdtCkVZ91K7jbfAtRSqwCsgrS9PT73xDqVFwNzRiH/";

    ERC721Contract = await ERC721ContractFactory.deploy(mintPrice, baseURI);
    await ERC721Contract.deployed();
  });

  describe("mint", async function () {
    it("should revert because state is currently CLOSED", async function () {
      await expect(
        ERC721Contract.connect(buyer1).mint(
          [],
          ethers.utils.keccak256(ethers.constants.AddressZero),
          0,
          {
            value: ethers.utils.parseEther("0.01"),
          }
        )
      ).to.be.revertedWith("CysAmazingPhotos: Minting is closed.");
    });

    it("should revert because state is currently SOLDOUT", async function () {
      ERC721Contract.setState(3);
      await expect(
        ERC721Contract.connect(buyer1).mint(
          [],
          ethers.utils.keccak256(ethers.constants.AddressZero),
          0,
          {
            value: ethers.utils.parseEther("0.01"),
          }
        )
      ).to.be.revertedWith("CysAmazingPhotos: Minting is closed.");
    });

    it("should revert because buyer didn't send enough Eth ", async function () {
      ERC721Contract.setState(1);
      await expect(
        ERC721Contract.connect(buyer1).mint(
          [],
          ethers.utils.keccak256(ethers.constants.AddressZero),
          0,
          {
            value: ethers.utils.parseEther("0.001"),
          }
        )
      ).to.be.revertedWith("CysAmazingPhotos: Not enough Ether.");
    });

    xit("should mint an ERC721 token (PRESALE)", async function () {
      ERC721Contract.setState(1);
      const mintTx = await ERC721Contract.connect(buyer1).mint(
        [],
        ethers.utils.keccak256(ethers.constants.AddressZero),
        {
          value: ethers.utils.parseEther("0.01"),
        }
      );
      await mintTx.wait();
      expect(await ERC721Contract.balanceOf(buyer1.address)).to.be.equal(
        ethers.BigNumber.from(1)
      );
    });

    it("should mint an ERC721 token (PUBLIC SALE)", async function () {
      ERC721Contract.setState(2);
      const mintTx = await ERC721Contract.connect(buyer1).mint(
        [],
        ethers.utils.keccak256(ethers.constants.AddressZero),
        0,
        {
          value: ethers.utils.parseEther("0.01"),
        }
      );
      await mintTx.wait();
      expect(await ERC721Contract.balanceOf(buyer1.address)).to.be.equal(
        ethers.BigNumber.from(1)
      );
    });

    it("should revert because a contract can't mint.", async function () {
      ERC721Contract.setState(2);

      const SampleMinterContractFactory = await ethers.getContractFactory(
        "SampleMinter"
      );
      SampleMinterContract = await SampleMinterContractFactory.deploy();
      await SampleMinterContract.deployed();

      await expect(SampleMinterContract.tryToMint(ERC721Contract.address)).to.be
        .reverted;
    });
  });

  describe("nickname", async function () {
    it("should revert because non-owner can't set the nickname", async function () {
      ERC721Contract.setState(2);
      const mintTx = await ERC721Contract.connect(buyer1).mint(
        [],
        ethers.utils.keccak256(ethers.constants.AddressZero),
        0,
        {
          value: ethers.utils.parseEther("0.01"),
        }
      );
      await mintTx.wait();

      await expect(
        ERC721Contract.setNickname(ethers.BigNumber.from(1), "Goose")
      ).to.be.rejectedWith("CysAmazingPhotos: Non-owner set nickname");
    });

    it("should set the nickname of token 0 to Goose ", async function () {
      ERC721Contract.setState(2);
      const mintTx = await ERC721Contract.connect(buyer1).mint(
        [],
        ethers.utils.keccak256(ethers.constants.AddressZero),
        0,
        {
          value: ethers.utils.parseEther("0.01"),
        }
      );
      await mintTx.wait();

      const setNicknameTx = await ERC721Contract.connect(buyer1).setNickname(
        ethers.BigNumber.from(1),
        "Goose"
      );
      await setNicknameTx.wait();

      expect(
        await ERC721Contract.getNickname(ethers.BigNumber.from(1))
      ).to.be.equal("Goose");
    });
  });

  describe("Whitelist", async function () {
    it("should not let the owner change the state to PRESALE because the merkleroot hasn't been set", async function () {
      await expect(
        ERC721Contract.connect(deployer).setState(1)
      ).to.be.revertedWith("CysAmazingPhotos: Merkle Root isn't set.");
    });

    it("should set the merkleroot", async function () {
      let merkleRoot = getMerkleRoot(whitelist);
      await expect(ERC721Contract.setMerkleRoot(merkleRoot)).to.be.ok;
      expect(await ERC721Contract.merkleRoot()).to.be.equal(merkleRoot);
    });

    it("should allow the owner to change the state to PRESALE", async function () {
      let merkleRoot = getMerkleRoot(whitelist);
      await expect(ERC721Contract.setMerkleRoot(merkleRoot)).to.be.ok;
      await expect(ERC721Contract.setState(1)).to.be.ok;
    });

    it("should not allow the whitelisted buyer mint during PRESALE", async function () {
      let merkleRoot = getMerkleRoot(whitelist);
      await ERC721Contract.setMerkleRoot(merkleRoot);
      await ERC721Contract.setState(1);

      let userIndex = whitelist.indexOf(buyer1.address).toString();
      let userAddressAndIndex = buyer1.address.concat(userIndex);
      let userHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(userAddressAndIndex)
      );

      let merkleProof = getMerkleProof(
        whitelist,
        buyer1.address,
        whitelist.indexOf(buyer1.address)
      );
      let mintTx = await ERC721Contract.connect(buyer1).mint(
        merkleProof,
        userHash,
        whitelist.indexOf(buyer1.address),
        {
          value: ethers.utils.parseEther("0.01"),
        }
      );
      await mintTx.wait();
      expect(await ERC721Contract.balanceOf(buyer1.address)).to.be.equal(
        ethers.BigNumber.from(1)
      );
    });

    it("should allow the whitelisted buyer mint twice during PRESALE", async function () {
      let merkleRoot = getMerkleRoot(whitelist);
      await ERC721Contract.setMerkleRoot(merkleRoot);
      await ERC721Contract.setState(1);

      let userIndex = whitelist.indexOf(buyer1.address).toString();
      let userAddressAndIndex = buyer1.address.concat(userIndex);
      let userHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(userAddressAndIndex)
      );

      let merkleProof = getMerkleProof(
        whitelist,
        buyer1.address,
        whitelist.indexOf(buyer1.address)
      );
      let mintTx = await ERC721Contract.connect(buyer1).mint(
        merkleProof,
        userHash,
        whitelist.indexOf(buyer1.address),
        {
          value: ethers.utils.parseEther("0.01"),
        }
      );
      await mintTx.wait();
      await expect(
        ERC721Contract.connect(buyer1).mint(
          merkleProof,
          userHash,
          whitelist.indexOf(buyer1.address),
          {
            value: ethers.utils.parseEther("0.01"),
          }
        )
      ).to.be.revertedWith("CysAmazingPhotos: NFT already claimed.");
    });
  });

  describe("commit-reveal scheme", async function () {
    it("should commit and reveal random number", async function () {
      let currentReveal,
        currentCommit,
        currentCommitTx,
        currentRevealTx,
        currentRevealReturn;

      expect(await ERC721Contract.getBaseURI()).to.be.equal(
        "ipfs://QmQVBhdtCkVZ91K7jbfAtRSqwCsgrS9PT73xDqVFwNzRiH/"
      );
      // random hash
      currentReveal = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          "ipfs://QmaPiG9AzQo3w8FfQCLa6ZyyDGivXeZ7qsjNCHvcTVrNbz/"
        )
      );

      // the commit is the keccak256 hash of the contract address and the random hash generated earlier
      // return keccak256(abi.encodePacked(address(this), reveal));
      currentCommit = await ERC721Contract.connect(deployer).getHash(
        currentReveal
      );

      // commit the random hash generated from the random hash
      currentCommitTx = await ERC721Contract.connect(deployer).commit(
        currentCommit
      );
      await currentCommitTx.wait();

      ERC721Contract.setState(2);
      for (let mintNumber = 0; mintNumber <= 9; mintNumber++) {
        let mintTx = await ERC721Contract.connect(buyer1).mint(
          [],
          ethers.utils.keccak256(ethers.constants.AddressZero),
          0,
          {
            value: ethers.utils.parseEther("0.01"),
          }
        );
        await mintTx.wait();
      }

      currentRevealTx = await ERC721Contract.connect(deployer).reveal(
        "ipfs://QmaPiG9AzQo3w8FfQCLa6ZyyDGivXeZ7qsjNCHvcTVrNbz/"
      );
      currentRevealReturn = await currentRevealTx.wait();
      // event RevealHash(address sender, bytes32 revealHash, uint random);
      expect(await ERC721Contract.getBaseURI()).to.be.equal(
        "ipfs://QmaPiG9AzQo3w8FfQCLa6ZyyDGivXeZ7qsjNCHvcTVrNbz/"
      );
    });
  });

  describe("multiTransfer function", async function () {
    it("should mint and transfer 2 NFTs", async function () {
      ERC721Contract.setState(2);

      for (let mintNumber = 0; mintNumber <= 3; mintNumber++) {
        let mintTx = await ERC721Contract.connect(buyer1).mint(
          [],
          ethers.utils.keccak256(ethers.constants.AddressZero),
          0,
          {
            value: ethers.utils.parseEther("0.01"),
          }
        );
        await mintTx.wait();
      }

      await ERC721Contract.connect(buyer1).multiTransfer([
        [buyer1.address, buyer2.address, 1, []],
        [buyer1.address, buyer2.address, 2, []],
      ]);
    });
  });
});
