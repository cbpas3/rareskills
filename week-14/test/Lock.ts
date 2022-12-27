import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Test", function () {
  describe("Add 0x20 to bytecode", function () {
    it("should log the output", async function () {
      const CONTRACTFACTORY = await ethers.getContractFactory("Test");
      const CONTRACT = await CONTRACTFACTORY.deploy();
      await expect(await CONTRACT.testing()).to.be.ok;
    });
  });
});
