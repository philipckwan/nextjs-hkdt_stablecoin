// index.html
const version = "v0.4";

import {timeLog, mapEthereumNetwork} from '@/lib/PCKUtils'
import {useEffect, useState, useRef} from 'react'

import {USDC_ADDRESS, HKDT_ADDRESS, web3Sign, web3Verify, getNativeBalance, getERC20Balance, approveUSDCtoHKDT, depositUSDCToMintHKDT, burnHKDTToWithdrawUSDC} from "@/lib/EthersUtils";

const METAMASK_STATUS_NOT_CONNECTED = "metamask is not connected";
const METAMASK_STATUS_CONNECTED = "metamask is connected";
const METAMASK_STATUS_NOT_INSTALLED = "metamask is not installed";

const CONNECTED_WALLET_ADDRESS_NA = "n/a";

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage() {

  const [connectedWalletAddress, setConnectedWalletAddress] = useState(CONNECTED_WALLET_ADDRESS_NA);
  const [metamaskStatus, setMetamaskStatus] = useState(METAMASK_STATUS_NOT_CONNECTED);
  const [signedMessage, setSignedMessage] = useState("");
  const [signedSignature, setSignedSignature] = useState("");
  const [nativeBalance, setNativeBalance] = useState(0);
  const [verifyResults, setVerifyResults] = useState("");
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [hkdtBalance, setHkdtBalance] = useState(0);
  const [usdcToDeposit, setUsdcToDeposit] = useState(0);
  const [hkdtToBurn, setHkdtToBurn] = useState(0);

  
  function handleSignedMessageChange(event) {
    setSignedMessage(event.target.value);
  }

  function handleSignedSignatureChange(event) {
    setSignedSignature(event.target.value);
  }

  function handleUsdcToDeposit(event) {
    setUsdcToDeposit(event.target.value);
  }

  function handleHkdtToBurn(event) {
    setHkdtToBurn(event.target.value);
  }

  function approveUSDC() {
    timeLog(`AppHKDT.approveUSDC: will approve HKDT to transfer ${usdcToDeposit} USDC...`);
    approveUSDCtoHKDT(usdcToDeposit);
  }

  function depositUSDC() {
    timeLog(`AppHKDT.depositUSDC: will deposit ${usdcToDeposit} USDC to mint HKDT...`);
    depositUSDCToMintHKDT(usdcToDeposit);
  }

  function withdrawUSDC() {
    timeLog(`AppHKDT.withdrawUSDC: will burn ${hkdtToBurn} HKDT to withdraw USDC...`);
    burnHKDTToWithdrawUSDC(hkdtToBurn);
  }

  async function connectDisconnectWallet() {
    timeLog(`AppDAppHKDT.connectDisconnectWallet: 1.0;`);
    if (typeof window.ethereum === 'undefined') {
      setMetamaskStatus(METAMASK_STATUS_NOT_INSTALLED);
      return;
    }
    let accounts = undefined;
    if (connectedWalletAddress === CONNECTED_WALLET_ADDRESS_NA) {
      timeLog(`AppDAppHKDT.connectDisconnectWallet: about to connect...`);
      accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      setMetamaskStatus(METAMASK_STATUS_CONNECTED);
      timeLog(`AppDAppHKDT.connectDisconnectWallet: accounts: ${accounts};`);
      let selectedAddress = window.ethereum.selectedAddress;
      timeLog(`AppDAppHKDT.connectWallet: selectedAddress: ${selectedAddress};`);
      if (selectedAddress != null) {
        setConnectedWalletAddress(selectedAddress);
        setNativeBalance(await getNativeBalance(selectedAddress));
        setUsdcBalance(await getERC20Balance(USDC_ADDRESS, selectedAddress));
        setHkdtBalance(await getERC20Balance(HKDT_ADDRESS, selectedAddress));
      }
    } else {
      timeLog(`AppDAppHKDT.connectDisconnectWallet: about to disconnect...`);
      //accounts = await window.ethereum.request({method: 'wallet_requestPermissions', params: [{eth_accounts: {}}]});
      setConnectedWalletAddress(CONNECTED_WALLET_ADDRESS_NA);
    }
  }    
  
  async function trySign() {
    let signature = await web3Sign(signedMessage, connectedWalletAddress);
    timeLog(`AppDAppHKDT.trySign: signature:${signature};`);
    setSignedSignature(signature);
  }

  
  async function tryVerify() {
    let web3VerifyResults  = await web3Verify(signedMessage, signedSignature, connectedWalletAddress);
    if (web3VerifyResults) {
      setVerifyResults("signature matched");
    } else {
      setVerifyResults("signature NOT matched");
    }
    //const signerAddress = await ethers.utils.verifyMessage(signedMessage, signedSignature);
    //timeLog(`__tryVerify: signerAddress: ${signerAddress};`);
  }

  return (
    <> 
      <div>
        <table className="myTable">
          <tbody>
          <tr>
            <td>dApp HKDT</td>
            <td>{version}</td>
          </tr>          
          <tr>
            <td><button onClick={connectDisconnectWallet}>{connectedWalletAddress === CONNECTED_WALLET_ADDRESS_NA ? "Connect" : "Disconnect"} Wallet</button></td>
            <td>{metamaskStatus}</td>
          </tr>     
          <tr>
            <td>connected network</td>
            <td>{
              (typeof window !== "undefined") ? mapEthereumNetwork(window.ethereum.networkVersion)[0] : "n/a"
            }</td>
          </tr>     
          <tr>
            <td>connected wallet address</td>
            <td>{connectedWalletAddress}</td>
          </tr>      
          <tr>
            <td>Native Balance</td>
            <td>{nativeBalance}</td>
          </tr>
          {/**
          <tr>
            <td>Message to sign</td>
            <td><input type="text" id="signedMessage" name="signedMessage" onChange={handleSignedMessageChange} value={signedMessage} /></td>
            <td><button onClick={trySign}>Try Sign</button></td>
          </tr>      
          <tr>
            <td>Signed Signature</td>
            <td><input type="text" id="signedSignature" name="signedSignature" onChange={handleSignedSignatureChange} value={signedSignature} /></td>
          </tr>
          <tr>
            <td><button onClick={tryVerify}>Try Verify</button></td>
            <td>{verifyResults}</td>
          </tr>   
           */}
          <tr>
            <td>USDC Balance</td>
            <td>{usdcBalance}</td>
          </tr>
          <tr>
            <td>HKDT Balance</td>
            <td>{hkdtBalance}</td>
          </tr>
          <tr>
            <td>Amount of USDC to deposit</td>
            <td><input type="text" id="usdcToDeposit" name="usdcToDeposit" onChange={handleUsdcToDeposit} value={usdcToDeposit} /></td>
          </tr>
          <tr>
            <td>Approve USDC</td>
            <td><button onClick={approveUSDC}>Approve USDC</button></td>
          </tr>
          <tr>
            <td>Deposit USDC to mint HKDT</td>
            <td><button onClick={depositUSDC}>Deposit USDC</button></td>
          </tr>
          <tr>
            <td>Amount of HKDT to burn</td>
            <td><input type="text" id="hkdtToBurn" name="hkdtToBurn" onChange={handleHkdtToBurn} value={hkdtToBurn} /></td>
          </tr>
          <tr>
            <td>Burn HKDT to withdraw USDC</td>
            <td><button onClick={withdrawUSDC}>Withdraw USDC</button></td>
          </tr>
          </tbody>
        </table>
      </div>
      <p></p>
      <div>
      </div>
    </>
  );
}