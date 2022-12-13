const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = ethers;

describe("NFT", function () {
  let contract: any = null;
  let accounts: any = null;
  let provider: any = null;
  let tokenContract: any = null;
  const TOKEN_NAME = "CysToken";
  const TOKEN_SYMBOL = "CYT";
  const CAP = new BigNumber.from("1000000000000000000000000");

  const NAME = "CysNFT";
  const SYMBOL = "CNF";
  const MINT_PRICE_IN_WEI = new BigNumber.from("50000000000000000");
  const INITIAL_ETH_BALANCE = ethers.utils.hexStripZeros(
    ethers.utils.parseEther("20000").toHexString()
  );

  this.beforeEach(async function () {
    accounts = await ethers.getSigners();
    provider = await ethers.provider;
    const TOKEN_CONTRACT_FACTORY = await ethers.getContractFactory("CysToken");

    tokenContract = await upgrades.deployProxy(
      TOKEN_CONTRACT_FACTORY,
      [TOKEN_NAME, TOKEN_SYMBOL, CAP],
      { initializer: "initialize" }
    );

    await tokenContract.deployed();
    const ContractFactory = await ethers.getContractFactory("CysNFT");

    contract = await upgrades.deployProxy(
      ContractFactory,
      [NAME, SYMBOL, tokenContract.address, MINT_PRICE_IN_WEI],
      {
        initializer: "initialize",
      }
    );
    await contract.deployed();

    await provider.send("hardhat_setBalance", [
      accounts[1].address,
      INITIAL_ETH_BALANCE,
    ]);
  });

  describe("mint", async function () {
    it("should mint 1 NFT", async function () {
      const mintTx = await tokenContract.connect(accounts[1]).mint({
        value: ethers.utils.parseEther("1.0"),
      });
      await mintTx.wait();

      const allowanceTx = await tokenContract
        .connect(accounts[1])
        .increaseAllowance(contract.address, ethers.utils.parseEther("0.05"));
      await allowanceTx.wait();

      //   expect(
      //     await tokenContract
      //       .connect(accounts[1])
      //       .allowance(accounts[1].address, contract.address)
      //   ).to.be.equal(new BigNumber.from("50000000000000000"));

      await contract.connect(accounts[1]).mint();
      expect(await contract.balanceOf(accounts[1].address)).to.be.equal(1);
    });
  });
});
