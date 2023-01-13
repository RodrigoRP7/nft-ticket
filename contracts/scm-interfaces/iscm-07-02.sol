// SPDX-License-Identifier: MIT
// Developed by: Archivist (version: v0.1)
pragma solidity ^0.8.0;

/**
 * @dev Interface for dynamic ERC-721 token metadata.
 * Contracts implementing { IDynamicMetadata } enable modifying the metadata
 * of the NFT collection by specifying a new location (base URI).
 *
 * Metadata modification may be triggered by smart contract events or external calls.
 * The implementation of this interface can restrict access to an administrator role,
 * require some state to change or period to expire. Hence, there are multiple different
 * ways to implement { IDynamicMetadata }
 *
 * ---------------
 * RECOMMENDATION
 * ---------------
 * Follow the same scheme for all different metadata URIs and only modify the base URI,
 * while preserving the path and file names of each tokenId's metadata. 
 */

interface IDynamicMetadata {

    /**
     * @notice Updates the base URI of the NFT collection
     * @dev This function does not allow individual tokenId metadata modification.
     * For this to be done, a different implementation of the 'tokenURI' function
     * must be done.
     * @param newURI the new URI of the metadata
     */
    function updateBaseURI(string memory newURI) external;

}