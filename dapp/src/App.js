import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import HashStorage from './contract/HashStorage.json';
import SHA256 from 'crypto-js/sha256';
import axios from 'axios';

// IPFS Client
const ipfs = create('https://ipfs.infura.io:5001/api/v0');

function App() {
  const [jsonInput, setJsonInput] = useState('');
  // const [account, setAccount] = useState('');
  // const [contract, setContract] = useState(null);
  // const [provider, setProvider] = useState(null);

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No Hash here");



  useEffect(() => {
    const { ethereum } = window;
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
    const provider = new ethers.BrowserProvider(ethereum);
    const loadProvider = async () => {
      if (provider) {
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const contractAddress = "0x096025BF9Cc091702ACA28F268ABba82c30418D2";

        const contract = new ethers.Contract(
          contractAddress,
          HashStorage.abi,
          signer
        );
        console.log("App.js works", contract);
        setAccount(address);
        setContract(contract);
        setProvider(provider);
      } else {
        alert("Metamask Not Installed");
      }
    };
    provider && loadProvider();
  }, []);




  const contractAddress = "0x096025BF9Cc091702ACA28F268ABba82c30418D2"; // Replace with your contract address

  // Function to handle input
  const handleInput = (event) => {
    setJsonInput(event.target.value);
  };



  const apiPinata = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3OWQzODViNC0wNjU5LTQwMmMtYmJiOS1mNTRkOGE5MTE5OTciLCJlbWFpbCI6InJlY3J1aXNlcjZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjUxYTU2NTNmODQ3YzE1NjljZWY5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYzNiYzBkZTkyMjBhNzVjNjMwODYyZDg5M2Y3ZmI5NDIyMGE0OGI5MTA0ZTM4ZDgzZDY2ZDkyOWM4NzlkY2UyOSIsImV4cCI6MTc1NzE2ODA4NX0.uxLv3gb-pRLJIHhpTRVT1RnTp6R5TK58aTGhmPZLnUU"  // Function to upload the hash to IPFS and store it on the blockchain
  const storeHashOnBlockchain = async () => {
    try {
      // Convert JSON input to SHA-256 hash
      const hash = SHA256(jsonInput).toString();
      console.log('SHA-256 Hash:', hash);
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: hash,
        headers: {
          pinata_api_key: `51a5653f847c1569cef9`,
          pinata_secret_api_key: `c3bc0de9220a75c630862d893f7fb94220a48b9104e38d83d66d929c879dce29`,
          "Content-Type": "text",
        },
      });
    
    console.log("after res file",resFile);
    // const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
    const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
    console.log(ImgHash,account);
    await contract.add(account, ImgHash);
    console.log("after contract add");
    

    setFile(null);
    setFile("No image selected");
    alert("file Uploaded");

      // Upload the hash to IPFS
      // const added = await ipfs.add(hash);
      // const ipfsUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
      // console.log('IPFS URL:', ipfsUrl);

      // // Store the IPFS URL in the smart contract
      // const tx = await contract.storeHash(ipfsUrl);
      // await tx.wait();
      // console.log('Hash stored successfully on blockchain!');

    } catch (error) {
      console.error('Error uploading hash:', error);
    }
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    if (file) {
      try {
        // const formData = new FormData();
        // formData.append("file", file);
        // console.log(jsonInput)
        // const hash = SHA256(jsonInput).toString();
        // console.log('SHA-256 Hash:', hash);
        // file = hash;
        // console.log("file here",file)

          const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: file,
            headers: {
              pinata_api_key: `51a5653f847c1569cef9`,
              pinata_secret_api_key: `c3bc0de9220a75c630862d893f7fb94220a48b9104e38d83d66d929c879dce29`,
              "Content-Type": "multipart/form-data",
            },
          });
        
        console.log("after res file",resFile);
        // const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        console.log(ImgHash,account);
        await contract.add(account, ImgHash);
        console.log("after contract add");
        

        setFile(null);
        setFile("No image selected");
        alert("file Uploaded");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const retrieveFile = (event) => {
    // const data = event.target.files[0];
    // const reader = new window.FileReader();
    // reader.readAsArrayBuffer(data);
    // reader.onloadend = () => {
    //   setFile(event.target.files[0]);
    // };
    setFileName(event.target.value);
    // setJsonInput(event.target.value);
    event.preventDefault();
  };


  return (
    <div>
      <div className="top">
      <form action="submit" className="form" onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="choose">
          Choose Image
        </label>
        <input
          disabled={!account}
          type="file"
          id="file-upload"
          name="data"
          onChange={retrieveFile}
        ></input>
        <button type="submit" className="upload-button" disabled={!file}>
          Upload File
        </button>
      </form>
    </div>

      <h1>Store JSON Hash on IPFS and Blockchain</h1>
      <textarea
        rows="10"
        cols="50"
        placeholder="Enter JSON input here..."
        value={jsonInput}
        onChange={handleInput}
      />
      <br />
      {/* <button onClick={connectWallet}>Connect Wallet</button> */}
      <br />
      <button onClick={storeHashOnBlockchain}>Store Hash</button>
      <br />
      <p>Account: {account ? account : 'Not connected'}</p>
    </div>
  );
}

export default App;
