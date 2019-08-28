# OpenZeppelin GSN Starter Kit

An OpenZeppelin Starter Kit GSN containing React, OpenZeppelin SDK, OpenZeppelin Contracts, Gas Station Network, Truffle and Infura.

OpenZeppelin GSN Starter Kit comes with everything you need to start using Gas Station Network contracts inside your applications. It also includes all the GSN Providers & Web3 connectors that you need to abstract gas for your users.

In addition to the contents included in the [vanilla Starter Kit](https://github.com/OpenZeppelin/starter-kit/blob/master/README.md), this kit contains a step-by-step tutorial on how to enable Gas Station Network for a simple Counter Contract.

## Requirements

Install OpenZeppelin SDK, Ganache, and Truffle

```
npm install -g truffle@5.0.2 ganache-cli@6.3.0 @openzeppelin/cli@2.5.0
```

## Installation

Ensure you are in a new and empty directory, and run the `unpack` command with `OpenZeppelin/starter-kit-gsn` to create a starter project:

```javascript
openzeppelin unpack OpenZeppelin/starter-kit-gsn
```

## Run

In a new terminal window, run your local blockchain:

```
ganache-cli --deterministic
```

In your original terminal window, at the top level of your folder, initialize the project
and follow the prompts:

```javascript
openzeppelin init
```

In a new terminal window, in the `client` directory, run the React app:

```javascript
cd client
npm run start
```

## Test

Truffle can run tests written in Solidity or JavaScript against your smart contracts. Note the command varies slightly if you're in or outside of the truffle development console.

```javascript
// inside the development console.
test

// outside the development console..
truffle test
```

Jest is included for testing React components. Compile your contracts before running Jest, or you may receive some file not found errors.

```javascript
// ensure you are inside the client directory when running this
npm run test
```

## Build

To build the application for production, use the build script. A production build will be in the `client/build` folder.

```javascript
// ensure you are inside the client directory when running this
npm run build
```

## Why this kit?

This kit leverages GSN to create dapps that are ready for mass adoption. Free your users from
the initial burden of installing Metamask and obtaining Ether. Create blockchain applications
that are indistinguishable from Web2.0 apps.

This documents assumes familiarity with the [Gas Station Network](https://gsn.openzeppelin.com/). Check out our [GSN getting started guide](https://docs.openzeppelin.com/openzeppelin/gsn/getting-started) and [GSN Kit Tutorial](https://forum.openzeppelin.com/t/using-gas-station-network-starter-kit-on-a-local-network/1213) to learn more.

### How does it use Web3 with GSN?

This kit uses Open Zeppelin [network.js](https://github.com/OpenZeppelin/openzeppelin-network.js) to create the connection to Web3. Using a couple of flags for development and production you can see how the dapp obtains a context that is aware of Gas Station Network.

```javascript
// get GSN web3
const context = useWeb3Network("http://127.0.0.1:8545", {
  gsn: { dev: true }
});
```

### How are the contracts modified to use GSN?

The `Counter` contract is modified to inherit from `RelayRecipient`. Also, the counter contract is going to naively pay for all the transactions that are submitted. Note how the `acceptRelayedCall` determines this by returning 0.

```solidity
pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract Counter is Initializable, GSNRecipient {
  //it keeps a count to demonstrate stage changes
  uint private count;
  address private _owner;

  function initialize(uint num) public initializer {
    GSNRecipient.initialize();
    _owner = _msgSender();
    count = num;
  }

// accept all requests
  function acceptRelayedCall(
    address,
    address,
    bytes calldata,
    uint256,
    uint256,
    uint256,
    uint256,
    bytes calldata,
    uint256
    ) external view returns (uint256, bytes memory) {
    return _approveRelayedCall();
  }  ...
}
```

### How to know if my recipient has funds?

The frontend also has some functions to help you see how much remaining balance you have left.
Once it runs out, transactions will stop working because your dapp won't be able to pay the gas fee
on behalf of its users.

```js
const getDeploymentAndFunds = async () => {
  if (instance) {
    const isDeployed = await isRelayHubDeployedForRecipient(lib, _address);
    setIsDeployed(isDeployed);
    if (isDeployed) {
      const funds = await getRecipientFunds(lib, _address);
      setFunds(funds);
    }
  }
};
```

You can top your balance by sending funds to your contract using `npx oz-gsn fund-recipient --recipient ADDRESS` command or heading to the [dapp tool](https://gsn.ethereum.org/recipients).

### How is the RelayHub deployed locally?

When you run `npx oz fund-recipient`, the following [code](https://github.com/OpenZeppelin/openzeppelin-gsn-helpers/blob/master/src/fund.js) gets executed:

```js
// Ensure relayHub is deployed on the local network
if (options.relayHubAddress.toLowerCase() === data.relayHub.address.toLowerCase()) {
  await deployRelayHub(web3, options.from);
}
```

Note that on both mainnet and testnets, as well as local blockchain (`ganache`) environments, the address of the `RelayHub` contract is always `0xD216153c06E857cD7f72665E0aF1d7D82172F494`.

## FAQ

- **How do I use this with the Ganache-CLI?**

  It's as easy as modifying the config file! [Check out our documentation on adding network configurations](http://truffleframework.com/docs/advanced/configuration#networks).

- **Where is my production build?**

  The production build will be in the `client/build` folder after running `npm run build` in the `client` folder.

- **Where can I find more documentation?**

  Check out the [OpenZeppelin Starter Kits documentation](https://docs.openzeppelin.com/starter-kits/).
