import {timeLog} from '@/lib/PCKUtils'
import {Buffer} from 'buffer';
import {ethers} from "ethers";
const ERC20ABI = require('@/abis/ERC20.json');
const {abi:HKDT_ABI} = require('@/abis/HKDT.json');

const ETH_GAS_PRICE = "50";
const ETH_ERC20_APPROVAL_GAS_LIMIT = 80000;

export const USDC_ADDRESS = "0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c";
export const HKDT_ADDRESS = "0x83a9250121b87ffa80851d8b776b336d74c54f39";

export async function web3Sign(messageToSign, signerAddress) {
  timeLog(`EthersUtils.web3Sign: messageToSign:${messageToSign}; signerAddress:${signerAddress};`);
  try {
    const msgToSignHex = `0x${Buffer.from(messageToSign, 'utf8').toString('hex')}`;
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [msgToSignHex, signerAddress, ''],
    });
    return signature;
  } catch (err) {
    timeLog(`EthersUtils.web3Sign: ERROR: ${err};`);
  }
  return "";
}

export async function web3Verify(messageToVerify, signature, signerAddressToCheck) {
  let calculatedSignerAddress = await web3CalculateSignerAddress(messageToVerify, signature);
  timeLog(`EthersUtils.web3Verify: calculatedSignerAddress:${calculatedSignerAddress}; signerAddressToCheck:${signerAddressToCheck};`)
  return calculatedSignerAddress.toUpperCase() === signerAddressToCheck.toUpperCase();
}

export async function web3CalculateSignerAddress(messageToVerify, signature) {
  const signerAddress = await ethers.utils.verifyMessage(messageToVerify, signature);
  return signerAddress;
}

export async function getNativeBalance(walletAddress) {
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  let bnNativeBalance = await web3Provider.getBalance(walletAddress);
  let nativeBalance = ethers.utils.formatUnits(bnNativeBalance, 18);
  return nativeBalance;
}

export async function getERC20Balance(erc20ContractAddress, walletAddress) {
  timeLog(`EthersUtils.getERC20Balance: erc20ContractAddress:${erc20ContractAddress}; walletAddress:${walletAddress};`);
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  let tokenContract = new ethers.Contract(erc20ContractAddress, ERC20ABI, web3Provider);
  let tokenDecimalsFromContract = await tokenContract.decimals();
  let bnTokenBalance = await tokenContract.balanceOf(walletAddress);
  let tokenBalance = ethers.utils.formatUnits(bnTokenBalance, tokenDecimalsFromContract);
  return tokenBalance;
}

export async function approveUSDCtoHKDT(amount) {
  timeLog(`EthersUtils.approveUSDCtoHKDT: 1.0; amount:${amount};`);
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  let usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20ABI, web3Provider);
  let usdcDecimals = await usdcContract.decimals();
  let bnAmount = amount * 10 ** usdcDecimals;
  timeLog(`__bnAmount: ${bnAmount};`);

  const signerWallet = web3Provider.getSigner();
  timeLog(`EthersUtils.approveUSDCtoHKDT: 2.0;`);
  //let tokenContractTarget = new ethers.Contract(erc20ContractAddressTarget, ERC20ABI, web3Provider);
  const approvalTx = await usdcContract.connect(signerWallet).approve(HKDT_ADDRESS, bnAmount, {gasPrice: ethers.utils.parseUnits(ETH_GAS_PRICE, "gwei"), gasLimit: ETH_ERC20_APPROVAL_GAS_LIMIT});

  timeLog(JSON.stringify(approvalTx));
}

export async function depositUSDCToMintHKDT(amount) {
  timeLog(`EthersUtils.depositUSDCToMintHKDT: 1.0;`);
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  let usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20ABI, web3Provider);
  let usdcDecimals = await usdcContract.decimals();
  let bnAmount = amount * 10 ** usdcDecimals;

  const signerWallet = web3Provider.getSigner();
  timeLog(`EthersUtils.depositUSDCToMintHKDT: 2.0;`);
  let hkdtContract = new ethers.Contract(HKDT_ADDRESS, HKDT_ABI, web3Provider);
  timeLog(`EthersUtils.depositUSDCToMintHKDT: 3.0;`);
  const depositTx = await hkdtContract.connect(signerWallet).deposit(bnAmount, {gasPrice: ethers.utils.parseUnits(ETH_GAS_PRICE, "gwei"), gasLimit: ETH_ERC20_APPROVAL_GAS_LIMIT});
  timeLog(`EthersUtils.depositUSDCToMintHKDT: 4.0;`);
  timeLog(JSON.stringify(depositTx));
}

export async function burnHKDTToWithdrawUSDC(amount) {
  timeLog(`EthersUtils.burnHKDTToWithdrawUSDC: 1.0;`);
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  let hkdtContract = new ethers.Contract(HKDT_ADDRESS, HKDT_ABI, web3Provider);
  let hkdtDecimals = await hkdtContract.decimals();
  //timeLog(`max number:${Number.MAX_SAFE_INTEGER};`);
  let bnAmount = ethers.utils.parseUnits(amount.toString(), hkdtDecimals);

  const signerWallet = web3Provider.getSigner();
  timeLog(`EthersUtils.burnHKDTToWithdrawUSDC: 2.0; bnAmount:${bnAmount};`);
  const withdrawTx = await hkdtContract.connect(signerWallet).withdraw(bnAmount, {gasPrice: ethers.utils.parseUnits(ETH_GAS_PRICE, "gwei"), gasLimit: ETH_ERC20_APPROVAL_GAS_LIMIT});
  timeLog(`EthersUtils.burnHKDTToWithdrawUSDC: 4.0;`);
  timeLog(JSON.stringify(withdrawTx));

}
