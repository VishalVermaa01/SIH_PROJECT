// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashStorage {
    // Mapping to store IPFS hash URL by user's Ethereum address
    mapping(address => string) public userHashes;

    // Event to notify hash storage
    event HashStored(address indexed user, string ipfsHash);

    // Function to store the hash
    function storeHash(string memory _ipfsHash) public {
        // Store the hash associated with the user's address
        //userHashes[msg.sender].push(_ipfsHash);
        userHashes[msg.sender] = _ipfsHash;
        emit HashStored(msg.sender, _ipfsHash);
    }

    // Function to get the stored hash
    function getHash(address _user) public view returns (string memory) {
        return userHashes[_user];
    }
}
