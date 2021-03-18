// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract GreeterStorageConflict {

    uint greets;
    string greeting;

    function initialize(string memory _greeting) public {
        greeting = _greeting;
    }

    function greet() public returns (string memory) {
        greets = greets + 1;
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }

}

import "./utils/Proxiable.sol";
contract GreeterStorageConflictProxiable is GreeterStorageConflict, Proxiable {}
