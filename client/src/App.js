import React, { Component, useState } from 'react';

import { useWeb3Network } from '@openzeppelin/network';
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

  componentDidMount = async () => {};

  componentWillUnmount() {}

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
  // get GSN web3
  const context = useWeb3Network('http://127.0.0.1:8545', {
    gsn: {
      dev: true,
    },
  });
  console.log(context);

  // load Counter json artifact
  let counterJSON = undefined;
  try {
    counterJSON = require('../../contracts/Counter.sol');
  } catch (e) {
    console.log(e);
  }

  // load Counter instance
  const [counterInstance, setCounterInstance] = useState(undefined);
  let deployedNetwork = undefined;
  if (!counterInstance && context && counterJSON.networks && context.networkId) {
    deployedNetwork = counterJSON.networks[context.networkId.toString()];
    if (deployedNetwork) {
      setCounterInstance(new context.lib.eth.Contract(counterJSON.abi, deployedNetwork.address));
    }
  }

  function renderNoWeb3() {
    return (
      <div className={styles.loader}>
        <h3>Web3 Provider Not Found</h3>
        <p>Please, install and run Ganache.</p>
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
          <h1>BUIDL with GSN Kit!</h1>
          <div className={styles.widgets}>
            <Web3Info title="Web3 Provider" context={context} />
            <Counter {...context} JSON={counterJSON} instance={counterInstance} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
