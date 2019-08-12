pragma solidity ^0.5.0;

import "tabookey-gasless/contracts/GsnUtils.sol";
import "tabookey-gasless/contracts/IRelayHub.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract Counter is Initializable, RelayRecipient {
  //it keeps a count to demonstrate stage changes
  uint private count;
  address private _owner;

  function initialize(uint num) public initializer {
    _owner = msg.sender;
    count = num;
  }

  function getHubAddr() public view returns (address) {
    return address(0xD216153c06E857cD7f72665E0aF1d7D82172F494);
  }

  // accept all requests 
  function acceptRelayedCall(
    address relay,
    address from,
    bytes calldata encodedFunction,
    uint256 transactionFee,
    uint256 gasPrice,
    uint256 gasLimit,
    uint256 nonce,
    bytes calldata approvalData,
    uint256 maxPossibleCharge
    ) external view returns (uint256, bytes memory) {
    return (0, "free");
  }

  function preRelayedCall(bytes calldata context) /*relayHubOnly*/ external returns (bytes32) {
    return bytes32(uint(42));
  }

  function postRelayedCall(bytes calldata context, bool success, uint actualCharge, bytes32 preRetVal) /*relayHubOnly*/ external {
  }

  function owner() public view returns (address) {
    return _owner;
  }

  // getter
  function getCounter() public view returns (uint) {
    return count;
  }

  //and it can add to a count
  function increaseCounter(uint256 amount) public {
    count = count + amount;
  }

  //We'll upgrade the contract with this function after deploying it
  //Function to decrease the counter
  // function decreaseCounter(uint256 amount) public returns (bool) {
  //   require(count > amount, "Cannot be lower than 0");
  //   count = count - amount;
  //   return true;
  // }
}
