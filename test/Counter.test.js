const { getAccounts, getContract } = require('asado');

const Counter = getContract('Counter');

let counter;
let deployer;
let accounts;
let args;

const initValue = '32';

describe('Counter', () => {
  beforeAll(async () => {
    [, deployer, ...accounts] = await getAccounts();
    args = { from: deployer, gas: 2e6 };

    // deploy your contract
    counter = await Counter.deploy().send(args);
  });

  it('counter is zero at start', async () => {
    expect(await counter.methods.getCounter().call()).toEqual('0');
  });

  describe('after initialize call', () => {
    beforeAll(async () => {
      await counter.methods.initialize(initValue).send(args);
      const value = await counter.methods.getCounter().call();
      expect(value).toEqual(initValue);
    });

    it('owner is properly set', async () => {
      expect(await counter.methods.owner().call()).toEqual(deployer);
    });

    it('should increase counter value', async () => {
      await counter.methods.increaseCounter(32).send(args);
      const value = await counter.methods.getCounter().call();
      expect(value).toEqual('64');
    });

    it('should descrease counter value', async () => {
      await counter.methods.decreaseCounter(32).send(args);
      const value = await counter.methods.getCounter().call();
      expect(value).toEqual(initValue);
    });
  });
});
