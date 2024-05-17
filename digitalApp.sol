// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract WalletLogin  {
    mapping(address => bool) private registeredUsers;
    mapping(address => uint256) private nonces;

    event UserRegistered(address user);
    event UserLoggedIn(address user, uint256 nonce);

    function register() public {
        require(!registeredUsers[msg.sender], "User already registered.");
        registeredUsers[msg.sender] = true;
        nonces[msg.sender] = 0;
        emit UserRegistered(msg.sender);
    }
    function getNonce() public view returns (uint256) {
        require(registeredUsers[msg.sender], "User not registered.");
        return nonces[msg.sender];
    }
    function login(uint256 _nonce, bytes memory _signature) public {
        require(registeredUsers[msg.sender], "User not registered.");
        require(_nonce == nonces[msg.sender], "Invalid nonce.");

        bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, _nonce)));
        require(recoverSigner(message, _signature) == msg.sender, "Invalid signature.");

        nonces[msg.sender]++;
        emit UserLoggedIn(msg.sender, _nonce);
    }
    function prefixed(bytes32 _hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash));
    }
    function recoverSigner(bytes32 _message, bytes memory _sig) internal pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(_sig);
        return ecrecover(_message, v, r, s);
    }
    function splitSignature(bytes memory _sig) internal pure returns (uint8, bytes32, bytes32) {
        require(_sig.length == 65, "Invalid signature length.");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }

        return (v, r, s);
    }

}