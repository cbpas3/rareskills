const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = ethers;

describe("Clone contract test", function () {
  describe("when a clone is deployed", async function () {
    it("should test the clone if it mints", async function () {
      let contract: any = null;
      let accounts: any = null;
      let provider: any = null;

      const TOKEN_NAME = "CysToken";
      const SYMBOL = "CYT";
      const CAP = new BigNumber.from("1000000000000000000000000");

      const ContractFactory = await ethers.getContractFactory(
        "ERC20CloneFactory"
      );
      contract = await ContractFactory.deploy();

      await contract.deployed();

      let clone1Address = await contract.callStatic.createToken(
        "CyClone",
        "CyC",
        20
      );
      await contract.createToken("CyClone", "CyC", 20);

      let clone1 = await (
        await ethers.getContractFactory("CysToken")
      ).attach(clone1Address);
      expect(await clone1.name()).to.equal("CyClone");
    });
  });
});
