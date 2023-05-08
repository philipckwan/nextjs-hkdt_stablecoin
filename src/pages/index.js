// index.html
const version = "v1.0";

import {timeLog, mapEthereumNetwork} from '@/lib/PCKUtils'
import {useState} from 'react'

import {USDC_ADDRESS, HKDT_ADDRESS, web3Sign, web3Verify, getNativeBalance, getERC20Balance, approveUSDCtoHKDT, depositUSDCToMintHKDT, burnHKDTToWithdrawUSDC} from "@/lib/EthersUtils";

const METAMASK_STATUS_NOT_CONNECTED = "metamask is not connected";
const METAMASK_STATUS_CONNECTED = "metamask is connected";
const METAMASK_STATUS_NOT_INSTALLED = "metamask is not installed";

const CONNECTED_WALLET_ADDRESS_NA = "n/a";
const CONNECTED_NETWORK_NA = "n/a";

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage() {

  const [connectedWalletAddress, setConnectedWalletAddress] = useState(CONNECTED_WALLET_ADDRESS_NA);
  const [connectedNetwork, setConnectedNetwork] = useState(CONNECTED_NETWORK_NA);
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
        setConnectedNetwork(mapEthereumNetwork(window.ethereum.networkVersion)[0]);
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
        <h1 className="text-2xl">HKDT exchange with USDT</h1>
        <p>
        This is a dApp (decentralized application) that runs only on <b>Ethereum Goerli (a Testnet of Ethereum)</b>.<br />
        It provides an exchange between HKDT, a mock stablecoin, with USDT.<br/>
        Because all components of this dApp, including the smart contract, the token contract, are all running only on Ethereum Goerli.<br/>
        Therefore, there is no real value in either of the HKDT or the USDT.<br/>
        In other words, this dApp will not scam any of your real ETH, or USDT on the Ethereum Mainnet.<br/>
        </p><br/>
        <p>
        First, use Metamask to connect your wallet to this dApp.<br/>
        Ensure that you are using an account that has native balance (GoerliETH) on the Ethereum Goerli network.<br/>
        Ensure that you are connecting to the Ethereum Goerli network from metamask.
        </p>
        <table className="myTable bg-gray-100 sm:bg-yellow-300 md:bg-green-300">
          <tbody>
          <tr>
            <td>dApp HKDT</td>
            <td>{version}</td>
          </tr>          
          <tr>
            <td><button className="inline-block px-1 py-1 rounded-lg shadow-sm bg-indigo-500 text-white" onClick={connectDisconnectWallet}>{connectedWalletAddress === CONNECTED_WALLET_ADDRESS_NA ? "Connect" : "Disconnect"} Wallet</button></td>
            <td>{metamaskStatus}</td>
          </tr>     
          <tr>
            <td>connected network</td>
            <td>{
              //(typeof window !== "undefined") ? mapEthereumNetwork(window.ethereum.networkVersion)[0] : "n/a"
              connectedNetwork
            }</td>
          </tr>     
          <tr>
            <td>connected wallet address</td>
            <td>{connectedWalletAddress}</td>
          </tr>      
          </tbody>
        </table><br/>
        <p>
        Once connected with your wallet, check that your native balance shows below<br/>
        Also note that the two token, HKDT and USDT, balances are show.<br/>        
        </p>
        <table className="myTable bg-gray-100 sm:bg-yellow-300 md:bg-green-300">
          <tbody>
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
          </tbody>
        </table><br/>
        <p>
        Next, assume that you have some balances of USDT and/or HKDT, you can swap (i.e. exchange) between them<br/>
        For swapping from USDT to HKDT, you need to execute 2 transactions:<br/>
        1) Input the amount of USDT to exchange, then click on the "Approve USDT" button and sign the transaction at metamask<br/>
        2) Once the first transaction is approved, click on the "Deposit USDT" button and sign the transaction at metamask<br/>
        For swapping from HKDT to USDT, you need to execute 1 transaction:<br/>
        1) Input the amount of HKDT to exchange, then click on the "Withdraw USDT" button and sign the transaction at metamask<br/>
        Once the transactions are confirmed on the network, refresh your balance by reconnecting the wallet. You should see that your exchange has been executed.<br/>
        </p>
        <table className="myTable bg-gray-100 sm:bg-yellow-300 md:bg-green-300">
          <tbody>
          <tr>
            <td>Amount of USDC to deposit</td>
            <td><input type="text" id="usdcToDeposit" name="usdcToDeposit" onChange={handleUsdcToDeposit} value={usdcToDeposit} /></td>
          </tr>
          <tr>
            <td>Approve USDC</td>
            <td><button className="inline-block px-1 py-1 rounded-lg shadow-sm bg-indigo-500 text-white" onClick={approveUSDC}>Approve USDC</button></td>
          </tr>
          <tr>
            <td>Deposit USDC to mint HKDT</td>
            <td><button className="inline-block px-1 py-1 rounded-lg shadow-sm bg-indigo-500 text-white" onClick={depositUSDC}>Deposit USDC</button></td>
          </tr>
          <tr>
            <td>Amount of HKDT to burn</td>
            <td><input type="text" id="hkdtToBurn" name="hkdtToBurn" onChange={handleHkdtToBurn} value={hkdtToBurn} /></td>
          </tr>
          <tr>
            <td>Burn HKDT to withdraw USDC</td>
            <td><button className="inline-block px-1 py-1 rounded-lg shadow-sm bg-indigo-500 text-white" onClick={withdrawUSDC}>Withdraw USDC</button></td>
          </tr>
          </tbody>
        </table><br/>
        <p>
          Reference information:<br/>
          The smart contract that this dApp interacts with is at <u><a href="https://goerli.etherscan.io/address/0x83a9250121b87ffa80851d8b776b336d74c54f39">0x83a9250121b87ffa80851d8b776b336d74c54f39</a></u><br/>
          The token contract of USDT is at <u><a href="https://goerli.etherscan.io/address/0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C">0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C</a></u><br/>
        The token contract of HKDT is at <u><a href="https://goerli.etherscan.io/address/0x83a9250121b87fFa80851D8b776b336D74C54F39">0x83a9250121b87fFa80851D8b776b336D74C54F39</a></u><br/>
        </p>

      </div>
      <p></p>
      <div>
      </div>
    </>
  );
}