import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import HashStorage from './contract/HashStorage.json';
import SHA256 from 'crypto-js/sha256';
import axios from 'axios';

function App() {
  const [jsonInput, setJsonInput] = useState('');
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




  // const contractAddress = "0x096025BF9Cc091702ACA28F268ABba82c30418D2";

  const handleInput = (event) => {
    setJsonInput(event.target.value);
  };



  // const apiPinata = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3OWQzODViNC0wNjU5LTQwMmMtYmJiOS1mNTRkOGE5MTE5OTciLCJlbWFpbCI6InJlY3J1aXNlcjZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjUxYTU2NTNmODQ3YzE1NjljZWY5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYzNiYzBkZTkyMjBhNzVjNjMwODYyZDg5M2Y3ZmI5NDIyMGE0OGI5MTA0ZTM4ZDgzZDY2ZDkyOWM4NzlkY2UyOSIsImV4cCI6MTc1NzE2ODA4NX0.uxLv3gb-pRLJIHhpTRVT1RnTp6R5TK58aTGhmPZLnUU"  // Function to upload the hash to IPFS and store it on the blockchain
  const userfilename = "File name"
  const storeHashOnBlockchain = async () => {
    try {
      // Convert JSON input to SHA-256 hash
      const hash = SHA256(jsonInput).toString();
      console.log('SHA-256 Hash:', hash);

      const data = JSON.stringify({
        pinataOptions: {
          cidVersion: 1,
        },
        pinataMetadata: {
          name: userfilename,
        },
        pinataContent: {
          hash: hash
        }
      });

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: '51a5653f847c1569cef9',
          pinata_secret_api_key: 'c3bc0de9220a75c630862d893f7fb94220a48b9104e38d83d66d929c879dce29',
          "Content-Type": 'application/json', //text
        },
      });
    
    console.log("ipfs response:",resFile.data);

    const ipfsHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
  
    await contract.storeHash(ipfsHash);
    console.log("url",ipfsHash);

    console.log("Hash stored successfully on blockchain!");
    } catch (error) {
      console.error('Error uploading hash:', error);
    }
  };

  const retrieveFile = (event) => {
    setFileName(event.target.value);
    event.preventDefault();
  };


  // -------------------------- Retrival --------------------------------
  const [data, setData] = useState("");

  const getdata = async () => {
    let dataArray;
    const Otheraddress = document.querySelector(".address-input").value;
    try {
      if (Otheraddress) {
        dataArray = await contract.getHash(Otheraddress);
        console.log("here ",dataArray);
      } else {
        dataArray = await contract.getHash(account);
      }
    } catch (e) {
      alert("You don't have access");
    }
    const isEmpty = Object.keys(dataArray).length === 0;
 

    if (!isEmpty) {
      const str = dataArray.toString();
      const str_array = str.split(",");
      const hashes = str_array.map((item, i) => {
        return (
          <a href={item} key={i} target="_blank" rel="noreferrer">
          <div>{item}</div>
          </a>
        );
      });
      setData(hashes);
    } else {
      alert("No hash to display");
    }
  };

  // --------------------------------------------------------------------
  // ==========================
  // --------------------------- ALLOW ----------------------------------


  // --------------------------- Revoke ---------------------------------

  return (
<>
    <div>
      <h1>Store JSON Hash on IPFS and Blockchain</h1>
      <textarea
        rows="10"
        cols="50"
        placeholder="Enter JSON input here..."
        value={jsonInput} 
        onChange={handleInput}
      />
      <button onClick={storeHashOnBlockchain}>Store Hash</button>
      <p>Account: {account ? account : 'Not connected'}</p>
    </div>
    <div>
      <div className="hash-list">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className='address-input'
      ></input>
      <button className="display-button" onClick={getdata}>
        Get Data
      </button>
    </div>
    </>
  );
}

export default App;
