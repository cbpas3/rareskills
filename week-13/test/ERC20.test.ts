const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = ethers;

const easyMint = async (contract: any, account: any) => {
  const mintTx = await contract
    .connect(account)
    .mint({ value: ethers.utils.parseEther("1.0") });
  await mintTx.wait();
  return true;
};

describe.skip("Token", function () {
  let contract: any = null;
  let accounts: any = null;
  let provider: any = null;

  const TOKEN_NAME = "CysToken";
  const SYMBOL = "CYT";
  const CAP = new BigNumber.from("1000000000000000000000000");

  beforeEach(async function () {
    const ContractFactory = await ethers.getContractFactory("CysToken");

    contract = await upgrades.deployProxy(
      ContractFactory,
      [TOKEN_NAME, SYMBOL, CAP],
      { initializer: "initialize" }
    );

    await contract.deployed();

    accounts = await ethers.getSigners();
    provider = await ethers.provider;

    const INITIAL_ETH_BALANCE = ethers.utils.hexStripZeros(
      ethers.utils.parseEther("20000").toHexString()
    );

    await provider.send("hardhat_setBalance", [
      accounts[1].address,
      INITIAL_ETH_BALANCE,
    ]);
  });

  describe("Initialization", async function () {
    it("should set account[0] as the owner", async function () {
      expect(await contract.owner()).to.equal(accounts[0].address);
    });

    it("has a name", async function () {
      expect(await contract.name()).to.equal(TOKEN_NAME);
    });

    it("has a symbol", async function () {
      expect(await contract.symbol()).to.equal(SYMBOL);
    });

    it("has 18 decimals", async function () {
      expect(await contract.decimals()).to.be.equal(18);
    });
  });

  describe("mint", async function () {
    it("buyer should gain 1 token", async function () {
      await easyMint(contract, accounts[1]);

      expect(await contract.balanceOf(accounts[1].address)).to.equal(
        new BigNumber.from("1000000000000000000000")
      );
    });

    it("should revert saying not enough", async function () {
      await expect(
        contract
          .connect(accounts[1])
          .mint({ value: ethers.utils.parseEther("0.5") })
      ).to.be.revertedWith("CysToken: Wrong amount of Eth sent.");
    });

    xit("should revert saying that the contract does not have tokens", async function () {
      const counter = [...Array(1000).keys()];
      for await (const count of counter) {
        await easyMint(contract, accounts[1]);
      }

      await expect(
        contract
          .connect(accounts[1])
          .mint({ value: ethers.utils.parseEther("1.0") })
      ).to.be.revertedWith("CysToken: Insufficient tokens in contract.");
    });
  });

  describe("withdraw", async function () {
    it("should not allow non-admin to withdraw", async function () {
      await expect(
        contract.connect(accounts[1]).withdrawEth()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Contract balance should be transferred to admin", async function () {
      const INITIAL_BALANCE = await provider.getBalance(accounts[0].address);

      await contract
        .connect(accounts[1])
        .mint({ value: ethers.utils.parseEther("1.0") });

      await contract.connect(accounts[0]).withdrawEth();

      await expect(
        await provider.getBalance(accounts[0].address)
      ).to.be.closeTo(
        INITIAL_BALANCE.add(new BigNumber.from(ethers.utils.parseEther("1"))),
        new BigNumber.from(ethers.utils.parseEther("0.001"))
      );
    });
  });
});

describe("NFT", function () {
  let contract: any = null;
  let accounts: any = null;
  let provider: any = null;

  beforeEach(async function () {
    const ContractFactory = await ethers.getContractFactory("CysNFT");
    contract = await upgrades.deployProxy(
      ContractFactory,
      ["CysToken", "CYT", new BigNumber.from("1000000000000000000000000")],
      { initializer: "initialize" }
    );

    await contract.deployed();

    accounts = await ethers.getSigners();
    provider = await ethers.provider;

    let twentyThousandEtherInHex: any;
    twentyThousandEtherInHex = ethers.utils.hexStripZeros(
      ethers.utils.parseEther("20000").toHexString()
    );

    await provider.send("hardhat_setBalance", [
      accounts[1].address,
      twentyThousandEtherInHex,
    ]);
  });
});
