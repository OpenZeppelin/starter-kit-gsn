import React, { useState, useEffect } from 'react';
import { PublicAddress, Button } from 'rimble-ui';
import styles from './Counter.module.scss';

import { utils } from '@openzeppelin/gsn-provider';
const { isRelayHubDeployedForRecipient, getRecipientFunds } = utils;

export default function Counter(props) {
  const { instance, accounts, lib } = props;
  const { _address, methods } = instance || {};

  const [isDeployed, setIsDeployed] = useState(false);
  const [funds, setFunds] = useState(0);

  useEffect(() => {
    getDeploymentAndFunds();
  }, [instance]);

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

  const [count, setCount] = useState(0);

  useEffect(() => {
    getCount();
  }, [instance]);

  const getCount = async () => {
    if (instance) {
      // Get the value from the contract to prove it worked.
      const response = await instance.methods.getCounter().call();
      // Update state with the result.
      setCount(response);
    }
  };

  const increase = async number => {
    await instance.methods.increaseCounter(number).send({ from: accounts[0] });
    getCount();
    getDeploymentAndFunds();
  };

  const decrease = async number => {
    await instance.methods.decreaseCounter(number).send({ from: accounts[0] });
    getCount();
    getDeploymentAndFunds();
  };

  function renderNoDeploy() {
    return (
      <div>
        <p>
          <strong>Can't Load Deployed Counter Instance</strong>
        </p>
        <p>Please, run `oz create` to deploy an counter instance.</p>
      </div>
    );
  }

  function renderNoFunds() {
    return (
      <div>
        <p>
          <strong>The recipient has no funds</strong>
        </p>
        <p>Please, run:</p>
        <div className={styles.code}>
          <code>
            npx oz-gsn fund-recipient --recipient <small>{_address}</small>
          </code>
        </div>
        <p>to fund the recipient on local network.</p>
      </div>
    );
  }

  return (
    <div className={styles.counter}>
      <h3> Counter Instance </h3>
      {lib && !instance && renderNoDeploy()}
      {lib && instance && (
        <React.Fragment>
          <div className={styles.dataPoint}>
            <div className={styles.label}>Instance address:</div>
            <div className={styles.value}>
              <PublicAddress label="" address={_address} />
            </div>
          </div>
          <div className={styles.dataPoint}>
            <div className={styles.label}>Counter Value:</div>
            <div className={styles.value}>{count}</div>
          </div>
          <div className={styles.dataPoint}>
            <div className={styles.label}>Recipient Funds:</div>
            <div className={styles.value}>{lib.utils.fromWei(funds.toString(), 'ether')} ETH</div>
          </div>
          {lib && instance && !funds && renderNoFunds()}
          {lib && instance && !!funds && (
            <React.Fragment>
              <div className={styles.label}>
                <strong>Counter Actions</strong>
              </div>
              <div className={styles.buttons}>
                <Button onClick={() => increase(1)} size="small">
                  Increase Counter by 1
                </Button>
                <Button onClick={() => decrease(1)} disabled={!(methods && methods.decreaseCounter)} size="small">
                  Decrease Counter by 1
                </Button>
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </div>
  );
}
