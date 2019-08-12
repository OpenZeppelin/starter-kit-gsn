import React, { useState, useEffect } from 'react';
import { PublicAddress, Button } from 'rimble-ui';
import styles from './Counter.module.scss';

export default function Counter(props) {
  const { instance, accounts, lib } = props;
  const { _address, methods } = instance || {};

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
  };

  const decrease = async number => {
    await instance.methods.decreaseCounter(number).send({ from: accounts[0] });
    getCount();
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
          <strong>A recipient has no funds</strong>
        </p>
        <p>
          Please, run `<strong>npx oz-gsn fund-recipient --recipient {_address.substring(0, 6)}... --amount 10</strong>`
          to fund the recipient.
        </p>
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
              <PublicAddress address={_address} />
            </div>
          </div>
          <div className={styles.dataPoint}>
            <div className={styles.label}>Counter Value:</div>
            <div className={styles.value}>{count}</div>
          </div>
          {lib && instance && true && renderNoFunds()}

          <div className={styles.label}>Counter Actions</div>
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
    </div>
  );
}
