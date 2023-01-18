const { generateWhitelistMerkleTree } = require("./merkleTreeGenerator");

let rootAndProof = generateWhitelistMerkleTree([
  "0x79Ea2d536b5b7144A3EabdC6A7E43130199291c0",
  "0x18c37f21D3C29f9a53A96CA678026DC660180065",
  "0x4B7E3FD09d45B97EF1c29085FCAe143444E422e8",
]);

console.log(rootAndProof);
