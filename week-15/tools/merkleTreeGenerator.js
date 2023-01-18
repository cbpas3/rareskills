/// Taken from https://betterprogramming.pub/how-to-create-a-whitelist-nft-collection-using-the-merkle-tree-dc0b34c412f0

const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = ethers.utils;

// 3. Creating a buffer since we bytes array
const padBuffer = (addr) => {
  return Buffer.from(addr.substr(2).padStart(32 * 2, 0), "hex");
};

function getMerkleRoot(whitelisted) {
  // 4. Creating buffer from leaves (lowest points in tree)
  const leaves = whitelisted.map((address) => padBuffer(address));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  // 5. Creating a merkleRoot that we'll inject into smart contract
  const merkleRoot = tree.getHexRoot();

  return merkleRoot;
}

function getMerkleProof(whitelisted, address) {
  const leaves = whitelisted.map((address) => padBuffer(address));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const merkleProof = tree.getHexProof(padBuffer(whitelisted[0]));
  return merkleProof;
}

module.exports = { getMerkleProof, getMerkleRoot };
