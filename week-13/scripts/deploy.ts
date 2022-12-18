import { ethers } from "hardhat";

async function main() {
  let nftContract: any = null;
  let tokenContract: any = null;
  let accounts: any = null;
  let provider: any = null;

  const TOKEN_NAME = "CysToken";
  const TOKEN_SYMBOL = "CYT";
  const TOKEN_CAP = 1000;

  const NFT_NAME = "CysNFT";
  const NFT_SYMBOL = "CNF";
  const NFT_MINT_PRICE = 1;
  const NFT_BASE_URI = "https://mydomain.com/metadata/";

  const TOKEN_CONTRACT_FACTORY = await ethers.getContractFactory("CysToken");
  const NFT_CONTRACT_FACTORY = await ethers.getContractFactory("CysNFT");

  tokenContract = await upgrades.deployProxy(
    TOKEN_CONTRACT_FACTORY,
    [TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP],
    { initializer: "initialize" }
  );

  await tokenContract.deployed();

  nftContract = await upgrades.deployProxy(
    NFT_CONTRACT_FACTORY,
    [NFT_NAME, NFT_SYMBOL, tokenContract.address, NFT_MINT_PRICE, NFT_BASE_URI],
    {
      initializer: "initialize",
    }
  );

  await nftContract.deployed();

  nftContract = await upgrades.upgradeProxy(
    nftContract.address,
    await ethers.getContractFactory("CysNFTv2")
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
