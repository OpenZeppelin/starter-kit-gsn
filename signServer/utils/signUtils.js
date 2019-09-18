const Web3 = require("web3");
const {
  utils: { toBN, soliditySha3 }
} = require("web3");
const web3 = new Web3("ws://localhost:8545");

function fixSignature(signature) {
  let v = parseInt(signature.slice(130, 132), 16);
  if (v < 27) {
    v += 27;
  }
  const vHex = v.toString(16);
  return signature.slice(0, 130) + vHex;
}
const signMessage = async data => {
  let accounts = await web3.eth.getAccounts();
  return fixSignature(
    await web3.eth.sign(
      soliditySha3(
        data.relayerAddress,
        data.from,
        data.encodedFunctionCall,
        toBN(data.txFee),
        toBN(data.gasPrice),
        toBN(data.gas),
        toBN(data.nonce),
        data.relayHubAddress,
        data.to
      ),
      accounts[0]
    )
  );
};
module.exports = { signMessage };
