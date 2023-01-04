import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import {
  Diamond,
  FacetA,
  DiamondCutFacet,
  DiamondLoupeFacet,
  OwnershipFacet,
  ERC721Facet,
} from "../typechain-types";

import {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets,
} from "./Diamond.js";

const { deployDiamond } = require("../scripts/deploy.ts");

describe("Test", function () {
  // async function deploy() {
  //   const [deployer, user] = await ethers.getSigners();

  //   const DiamondCutFacetContractFactory = await ethers.getContractFactory(
  //     "DiamondCutFacet"
  //   );
  //   const DiamondLoupeContractFactory = await ethers.getContractFactory(
  //     "DiamondLoupeFacet"
  //   );
  //   const OwnershipFacetContractFactory = await ethers.getContractFactory(
  //     "OwnershipFacet"
  //   );
  //   const FacetAContractFactory = await ethers.getContractFactory("FacetA");
  //   const DiamondContractFactory = await ethers.getContractFactory("Diamond");

  //   const DiamondCutFacetContract: DiamondCutFacet =
  //     await DiamondCutFacetContractFactory.deploy();
  //   await DiamondCutFacetContract.deployed();

  //   const DiamondLoupeContract: DiamondLoupeFacet =
  //     await DiamondLoupeContractFactory.deploy();
  //   await DiamondLoupeContract.deployed();

  //   const OwnershipFacetContract: OwnershipFacet =
  //     await OwnershipFacetContractFactory.deploy();
  //   await OwnershipFacetContract.deployed();

  //   const FacetAContract: FacetA = await FacetAContractFactory.deploy();
  //   await FacetAContract.deployed();

  //   const DiamondContract: Diamond = await DiamondContractFactory.deploy(
  //     deployer.address,
  //     DiamondCutFacetContract.address,
  //     DiamondLoupeContract.address,
  //     OwnershipFacetContract.address
  //   );

  //   await DiamondContract.deployed();

  //   return { DiamondContract, FacetAContract, deployer, user };
  // }

  // this.beforeEach(async function () {});
  // describe("Set up", function () {
  //   it("should return Diamond Contract, FacetAContract, deployer address and user address", async function () {
  //     const { DiamondContract, FacetAContract, deployer } = await loadFixture(
  //       deploy
  //     );
  //     expect(await FacetAContract.sayHello()).to.eq("Hello");
  //   });

  //   it.skip("should add facetA as a facet of the diamond contract", async function () {
  //     const { DiamondContract, FacetAContract, deployer } = await loadFixture(
  //       deploy
  //     );

  //     let ABI = [
  //       "function diamondCut((address facetAddress, uint8 action, bytes4[] functionSelectors),address _init,bytes calldata _calldata)",
  //     ];
  //     let iface = new ethers.utils.Interface(ABI);
  //     let bytecode = iface.encodeFunctionData("diamondCut", [
  //       [FacetAContract.address, 0, ["0xef5fb05b"]],
  //       ethers.constants.AddressZero,
  //       "0x",
  //     ]);

  //     let txResponse = await deployer.sendTransaction({
  //       to: DiamondContract.address,
  //       data: bytecode,
  //     });
  //     console.log(await txResponse.wait());
  //     expect(
  //       await deployer.sendTransaction({
  //         to: DiamondContract.address,
  //         data: bytecode,
  //       })
  //     ).to.be.ok;
  //   });
  // });
  let diamondAddress: string;
  let diamondCutFacet: DiamondCutFacet;
  let diamondLoupeFacet: DiamondLoupeFacet;
  let ownershipFacet: OwnershipFacet;
  let erc721Facet: ERC721Facet;
  let tx;
  let receipt;
  let result;
  const addresses: string[] = [];

  before(async function () {
    diamondAddress = await deployDiamond();
    diamondCutFacet = await ethers.getContractAt(
      "DiamondCutFacet",
      diamondAddress
    );
    diamondLoupeFacet = await ethers.getContractAt(
      "DiamondLoupeFacet",
      diamondAddress
    );
    ownershipFacet = await ethers.getContractAt(
      "OwnershipFacet",
      diamondAddress
    );
  });

  it("should have three facets -- call to facetAddresses function", async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address);
    }

    assert.equal(addresses.length, 3);
  });

  it("facets should have the right function selectors -- call to facetFunctionSelectors function", async () => {
    let selectors = getSelectors(diamondCutFacet);
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
    assert.sameMembers(result, selectors);
    selectors = getSelectors(diamondLoupeFacet);
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1]);
    assert.sameMembers(result, selectors);
    selectors = getSelectors(ownershipFacet);
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2]);
    assert.sameMembers(result, selectors);
  });

  it("selectors should be associated to facets correctly -- multiple calls to facetAddress function", async () => {
    assert.equal(
      addresses[0],
      await diamondLoupeFacet.facetAddress("0x1f931c1c")
    );
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress("0xcdffacc6")
    );
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress("0x01ffc9a7")
    );
    assert.equal(
      addresses[2],
      await diamondLoupeFacet.facetAddress("0xf2fde38b")
    );
  });

  it("should add test1 functions", async () => {
    const Test1Facet = await ethers.getContractFactory("Test1Facet");
    const test1Facet = await Test1Facet.deploy();
    await test1Facet.deployed();
    addresses.push(test1Facet.address);
    const selectors = getSelectors(test1Facet);
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: test1Facet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(test1Facet.address);
    assert.sameMembers(result, selectors);
  });

  it("should test function call", async () => {
    const test1Facet = await ethers.getContractAt("Test1Facet", diamondAddress);
    await test1Facet.test1Func10();
  });

  it("should add FacetA functions", async () => {
    const FacetA = await ethers.getContractFactory("FacetA");
    const facetAFacet = await FacetA.deploy();
    await facetAFacet.deployed();
    addresses.push(facetAFacet.address);
    const selectors = getSelectors(facetAFacet);
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: facetAFacet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(
      facetAFacet.address
    );
    assert.sameMembers(result, selectors);
  });

  it("should test function call to FacetA", async () => {
    const facetAFacet = await ethers.getContractAt("FacetA", diamondAddress);
    expect(await facetAFacet.sayHello()).to.be.equal("Hello");
  });

  it("should test FacetA set data", async () => {
    const facetAFacet = await ethers.getContractAt("FacetA", diamondAddress);
    await facetAFacet.setDataA(
      "0x0000000000000000000000000000000000000000000000000000000000000012"
    );
    expect(await facetAFacet.getDataA()).to.be.equal(
      "0x0000000000000000000000000000000000000000000000000000000000000012"
    );
  });

  it("should add ERC721Facet functions", async () => {
    const ERC721ContractFactory = await ethers.getContractFactory(
      "ERC721Facet"
    );
    erc721Facet = await ERC721ContractFactory.deploy();
    await erc721Facet.deployed();
    addresses.push(erc721Facet.address);
    const selectors = getSelectors(erc721Facet);
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: erc721Facet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(
      erc721Facet.address
    );
    assert.sameMembers(result, selectors);
  });

  it("should initialize ERC721 Facet", async () => {
    expect(erc721Facet.initializer("CyFigures", "CF", 10)).to.be.ok;
  });

  it("should revert because initialize can only be called once", async () => {
    await expect(erc721Facet.initializer("CyFigures", "CF", 10)).to.be.reverted;
  });

  it("should have a name", async () => {
    expect(await erc721Facet.getTokenName()).to.be.equal("CyFigures");
  });

  xit("should support erc721 interface", async () => {
    expect(await diamondLoupeFacet.supportsInterface("0x80ac58cd")).to.be.true;
  });
});
