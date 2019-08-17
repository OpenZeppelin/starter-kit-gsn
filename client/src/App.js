import React, { useState } from 'react';

import { useWeb3Network, useEphemeralKey } from '@openzeppelin/network';
import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';
import Hero from './components/Hero/index.js';
import Web3Info from './components/Web3Info/index.js';
import Counter from './components/Counter/index.js';

import styles from './App.module.scss';

const infuraToken = process.env.REACT_APP_INFURA_TOKEN;

function App() {
  // get ephemeralKey
  const signKey = useEphemeralKey();

  // get GSN web3
  const context = infuraToken
    ? useWeb3Network(`wss://rinkeby.infura.io/ws/v3/${infuraToken}`, {
        pollInterval: 15 * 1000,
        gsn: {
          signKey,
        },
      })
    : useWeb3Network('http://127.0.0.1:8545', {
        gsn: {
          dev: true,
          signKey,
        },
      });

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
            <Counter {...context} JSON={counterJSON} instance={counterInstance} deployedNetwork={deployedNetwork} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
