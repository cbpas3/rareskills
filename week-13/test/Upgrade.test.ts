const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = ethers;

describe.skip("Upgrade", function () {
  let nftContract: any = null;
  let tokenContract: any = null;
  let accounts: any = null;
  let provider: any = null;

  const TOKEN_NAME = "CysToken";
  const TOKEN_SYMBOL = "CYT";
  const TOKEN_CAP = new BigNumber.from("1000000000000000000000000");

  const NFT_NAME = "CysNFT";
  const NFT_SYMBOL = "CNF";
  const NFT_MINT_PRICE = new BigNumber.from("50000000000000000");
  const NFT_BASE_URI = "https://mydomain.com/metadata/";

  const INITIAL_ETH_BALANCE = ethers.utils.hexStripZeros(
    ethers.utils.parseEther("20000").toHexString()
  );

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    provider = await ethers.provider;

    const TOKEN_CONTRACT_FACTORY = await ethers.getContractFactory("CysToken");
    const NFT_CONTRACT_FACTORY = await ethers.getContractFactory("CysNFT");
    const STAKING_CONTRACT_FACTORY = await ethers.getContractFactory(
      "CysStaking"
    );

    tokenContract = await upgrades.deployProxy(
      TOKEN_CONTRACT_FACTORY,
      [TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP],
      { initializer: "initialize" }
    );

    await tokenContract.deployed();

    nftContract = await upgrades.deployProxy(
      NFT_CONTRACT_FACTORY,
      [
        NFT_NAME,
        NFT_SYMBOL,
        tokenContract.address,
        NFT_MINT_PRICE,
        NFT_BASE_URI,
      ],
      {
        initializer: "initialize",
      }
    );

    await nftContract.deployed();

    await provider.send("hardhat_setBalance", [
      accounts[1].address,
      INITIAL_ETH_BALANCE,
    ]);

    const mintTx = await tokenContract.connect(accounts[1]).mint({
      value: ethers.utils.parseEther("1.0"),
    });
    await mintTx.wait();

    const allowanceTx = await tokenContract
      .connect(accounts[1])
      .increaseAllowance(nftContract.address, ethers.utils.parseEther("0.05"));
    await allowanceTx.wait();

    await nftContract.connect(accounts[1]).mint();
  });

  describe("god mode", async function () {
    it("should upgrade and allow god mode", async function () {
      nftContract = await upgrades.upgradeProxy(
        nftContract.address,
        await ethers.getContractFactory("CysNFTv2")
      );
      await nftContract.godModeTransfer(
        accounts[2].address,
        accounts[1].address,
        1
      );

      expect(await nftContract.balanceOf(accounts[2].address)).to.be.equal(1);
    });
  });
});
