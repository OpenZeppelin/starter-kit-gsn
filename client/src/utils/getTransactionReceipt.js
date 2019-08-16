import sleep from './sleep';

export default async function getTransactionReceipt(web3, hash) {
  let receipt = null;
  while (receipt === null) {
    // we are going to check every second if transation is mined or not, once it is mined we'll leave the loop
    receipt = await getTransactionReceiptPromise(web3, hash);
    await sleep(1000);
  }
  return receipt;
}

function getTransactionReceiptPromise(web3, hash) {
  // here we just promisify getTransactionReceipt function for convenience
  return new Promise((resolve, reject) => {
    web3.eth.getTransactionReceipt(hash, function(err, data) {
      if (err !== null) reject(err);
      else resolve(data);
    });
  });
}
