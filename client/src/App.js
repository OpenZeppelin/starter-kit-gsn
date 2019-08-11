import React, { Component } from 'react';

import { useWeb3Injected } from '@openzeppelin/network';
import getWeb3, { getGanacheWeb3 } from './utils/getWeb3';
import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';
import Hero from './components/Hero/index.js';
import Web3Info from './components/Web3Info/index.js';
import Counter from './components/Counter/index.js';
import Instructions from './components/Instructions/index.js';
import { Loader } from 'rimble-ui';

import { solidityLoaderOptions } from '../config/webpack';

import styles from './App.module.scss';

class AppOld extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    route: window.location.pathname.replace('/', ''),
  };

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  };

  componentDidMount = async () => {
    const hotLoaderDisabled = solidityLoaderOptions.disabled;
    let CounterJSON = {};
    try {
      CounterJSON = require('../../contracts/Counter.sol');
    } catch (e) {
      console.log(e);
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      let ganacheAccounts = [];
      try {
        ganacheAccounts = await this.getGanacheAddresses();
      } catch (e) {
        console.log('Ganache is not running');
      }
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const networkType = await web3.eth.net.getNetworkType();
      const isMetaMask = web3.currentProvider.isMetaMask;
      let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]) : web3.utils.toWei('0');
      balance = web3.utils.fromWei(balance, 'ether');
      let instance = null;
      let deployedNetwork = null;
      if (CounterJSON.networks) {
        deployedNetwork = CounterJSON.networks[networkId.toString()];
        if (deployedNetwork) {
          instance = new web3.eth.Contract(CounterJSON.abi, deployedNetwork && deployedNetwork.address);
        }
      }
      if (instance) {
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        this.setState(
          {
            web3,
            ganacheAccounts,
            accounts,
            balance,
            networkId,
            networkType,
            hotLoaderDisabled,
            isMetaMask,
            contract: instance,
          },
          () => {
            this.refreshValues(instance);
            setInterval(() => {
              this.refreshValues(instance);
            }, 5000);
          },
        );
      } else {
        this.setState({
          web3,
          ganacheAccounts,
          accounts,
          balance,
          networkId,
          networkType,
          hotLoaderDisabled,
          isMetaMask,
        });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = instance => {
    if (instance) {
      this.getCount();
    }
  };

  renderLoader() {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  renderDeployCheck(instructionsKey) {
    return (
      <div className={styles.setup}>
        <div className={styles.notice}>
          Your <b> contracts are not deployed</b> in this network. Two potential reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.
            <br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name={instructionsKey}
          accounts={this.state.accounts}
        />
      </div>
    );
  }

  renderBody() {
    const { hotLoaderDisabled, networkType, accounts, ganacheAccounts } = this.state;
    const updgradeCommand = networkType === 'private' && !hotLoaderDisabled ? 'upgrade-auto' : 'upgrade';
    return (
      <div className={styles.wrapper}>
        {!this.state.web3 && this.renderLoader()}
        {this.state.web3 && !this.state.contract && this.renderDeployCheck('counter')}
        {this.state.web3 && this.state.contract && (
          <div className={styles.contracts}>
            <h1>Counter Contract is good to Go!</h1>
            <p>Interact with your contract on the right.</p>
            <p> You can see your account info on the left </p>
            <div className={styles.widgets}>
              <Web3Info {...this.state} />
              <Counter decrease={this.decreaseCount} increase={this.increaseCount} {...this.state} />
            </div>
            {this.state.balance < 0.1 && (
              <Instructions ganacheAccounts={ganacheAccounts} name="metamask" accounts={accounts} />
            )}
            {this.state.balance >= 0.1 && (
              <Instructions ganacheAccounts={this.state.ganacheAccounts} name={updgradeCommand} accounts={accounts} />
            )}
          </div>
        )}
      </div>
    );
  }

  renderInstructions() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Instructions ganacheAccounts={this.state.ganacheAccounts} name="setup" accounts={this.state.accounts} />
      </div>
    );
  }

  renderFAQ() {
    return (
      <div className={styles.wrapper}>
        <Instructions ganacheAccounts={this.state.ganacheAccounts} name="faq" accounts={this.state.accounts} />
      </div>
    );
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
        {this.state.route === '' && this.renderInstructions()}
        {this.state.route === 'counter' && this.renderBody()}
        {this.state.route === 'evm' && this.renderEVM()}
        {this.state.route === 'faq' && this.renderFAQ()}
        <Footer />
      </div>
    );
  }
}

function App() {
  // get web3 from injected provider
  const context = useWeb3Injected();

  // load Counter json artifact
  let counterJSON = undefined;
  try {
    counterJSON = require('../../contracts/Counter.sol');
  } catch (e) {
    console.log(e);
  }

  // load Counter instance
  let counterInstance = undefined;
  let deployedNetwork = undefined;
  if (counterJSON.networks && context.networkId) {
    deployedNetwork = counterJSON.networks[context.networkId.toString()];
    if (deployedNetwork) {
      counterInstance = new context.lib.eth.Contract(counterJSON.abi, deployedNetwork.address);
    }
  }

  function renderNoWeb3() {
    return (
      <div className={styles.loader}>
        <h3>Injected Web3 Provider Not Found</h3>
        <p>Please, install and enable MetaMask.</p>
      </div>
    );
  }

  return (
    <div className={styles.App}>
      <Header />
      <Hero />
      <div className={styles.wrapper}>
        {!context.lib && renderNoWeb3()}

        <div className={styles.contracts}>
          <div className={styles.widgets}>
            <Web3Info title="GSN Provider" context={context} />
            <Counter {...context} JSON={counterJSON} instance={counterInstance} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
