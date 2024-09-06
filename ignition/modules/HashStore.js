// const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



// module.exports = buildModule("LockModule", (m) => {
  

//   const HashStorageContract = m.contract("HashStorage", [unlockTime], {
//     value: lockedAmount,
//   });

//   return { HashStorageContract };
// });

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("HashStorageModule", (m) => {
  
  // Deploy the HashStorage contract
  const HashStorageContract = m.contract("HashStorage");

  // Return the deployed contract instance
  return { HashStorageContract };
});
