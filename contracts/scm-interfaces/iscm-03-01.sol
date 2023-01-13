// SPDX-License-Identifier: MIT
// Developed by: Archivist (version: v0.1)
pragma solidity ^0.8.0;

/**
 * @dev Interface for ERC-721 token minting with capped supply.
 * Contracts implementing { IMintCapped } interface enable new token
 * issuance within a limited range or maximum supply.
 */

interface IMintCapped {

    /**
     * @notice Mints a new token and assigns ownership to 'to'
     * @dev Throws if:
     * - 'numTokens' is equal to zero
     * - Current supply + 'numTokens' > Max supply
     *
     * Additional conditions can be added to the 'mint' functions:
     * # 'msg.value' must be higher than mint price
     * # 'numToken' must be lower than limit of tokens per mint
     * # ...
     *
     * @param to Address of the recipient/minter
     * @param numToken Number of tokens to mint
     *
     * USE '_safeMint' from OpenZeppelin ERC-721 implementation
     * This will emit a 'Transfer' event and perform all safety checks
     */
    function mint(address to, uint256 numToken) external payable;

    /**
     * @notice view of the max supply limit
     * @return uint256 Max supply state variable
     */
    function maxSupply() external view returns (uint256);
}


