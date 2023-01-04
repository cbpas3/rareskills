import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  Diamond,
  FacetA,
  DiamondCutFacet,
  DiamondLoupeFacet,
  OwnershipFacet,
} from "../typechain-types";

import {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets,
} from "./Diamond.js";

describe("Test", function () {
  async function deploy() {
    const [deployer, user] = await ethers.getSigners();

    const DiamondCutFacetContractFactory = await ethers.getContractFactory(
      "DiamondCutFacet"
    );
    const DiamondLoupeContractFactory = await ethers.getContractFactory(
      "DiamondLoupeFacet"
    );
    const OwnershipFacetContractFactory = await ethers.getContractFactory(
      "OwnershipFacet"
    );
    const FacetAContractFactory = await ethers.getContractFactory("FacetA");
    const DiamondContractFactory = await ethers.getContractFactory("Diamond");

    const DiamondCutFacetContract: DiamondCutFacet =
      await DiamondCutFacetContractFactory.deploy();
    await DiamondCutFacetContract.deployed();

    const DiamondLoupeContract: DiamondLoupeFacet =
      await DiamondLoupeContractFactory.deploy();
    await DiamondLoupeContract.deployed();

    const OwnershipFacetContract: OwnershipFacet =
      await OwnershipFacetContractFactory.deploy();
    await OwnershipFacetContract.deployed();

    const FacetAContract: FacetA = await FacetAContractFactory.deploy();
    await FacetAContract.deployed();

    const DiamondContract: Diamond = await DiamondContractFactory.deploy(
      deployer.address,
      DiamondCutFacetContract.address,
      DiamondLoupeContract.address,
      OwnershipFacetContract.address
    );

    await DiamondContract.deployed();

    return { DiamondContract, FacetAContract, deployer, user };
  }

  // this.beforeEach(async function () {});
  describe("Set up", function () {
    it("should return Diamond Contract, FacetAContract, deployer address and user address", async function () {
      const { DiamondContract, FacetAContract, deployer } = await loadFixture(
        deploy
      );
      expect(await FacetAContract.sayHello()).to.eq("Hello");
    });

    it.skip("should add facetA as a facet of the diamond contract", async function () {
      const { DiamondContract, FacetAContract, deployer } = await loadFixture(
        deploy
      );

      let ABI = [
        "function diamondCut((address facetAddress, uint8 action, bytes4[] functionSelectors),address _init,bytes calldata _calldata)",
      ];
      let iface = new ethers.utils.Interface(ABI);
      let bytecode = iface.encodeFunctionData("diamondCut", [
        [FacetAContract.address, 0, ["0xef5fb05b"]],
        ethers.constants.AddressZero,
        "0x",
      ]);

      let txResponse = await deployer.sendTransaction({
        to: DiamondContract.address,
        data: bytecode,
      });
      console.log(await txResponse.wait());
      expect(
        await deployer.sendTransaction({
          to: DiamondContract.address,
          data: bytecode,
        })
      ).to.be.ok;
    });
  });
});
