export function timeLog(msg) {
    let current = new Date();
    let currentTime  = current.toLocaleTimeString();
    console.log(`v2-[${currentTime}]${msg}`);
}

export function FormattedDate(props) {
    return <h2>It is {props.date.toLocaleTimeString()}</h2>
}

export function mapEthereumNetwork(networkID) {
    switch(networkID) {
      case "1":
        return ["Ethereum Mainnet", "ETH", "0xdAC17F958D2ee523a2206206994597C13D831ec7"];
      case "5":
        return ["Ethereum Goerli (Testnet)", "ETH", "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60"];
      case "137":
        return ["Polygon Mainnet", "MATIC", "0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97"];
      default:
        return [`unknown network [${networkID}]`, "???", undefined];
    }
  }