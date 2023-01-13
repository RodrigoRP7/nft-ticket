// SPDX-License-Identifier: MIT
// Developed by: Archivist (version: v0.1)
pragma solidity ^0.8.0;

/**
 * @dev Interface for sale functionality in ERC-721 token contracts.
 * Contracts implementing { ISaleNFT } interface allow non-fungible
 * token owners to sell NFTs for a stated price. Purchasers can buy
 * listed tokens by paying the listing price.
 *
 * ---------------
 * RECOMMENDATIONS
 * ---------------
 * - This interface is designed to be implemented in NFT collections
 *   that are to be traded in independent applications, while avoi-
 *   ding the complexity of building a marketplace.
 *
 * - Sale functionality should be kept off-chain as much as possible,
 *   as this provides a much friendlier and smoother UX.
 *
 * - This interface is suitable for NFTs that are not expected to 
 *   change ownership with high frequency and which are to be traded
 *   under simple but robust sales rules.
 */


interface ISaleNFT {

    /**
     * @dev Emitted when a 'tokenId' is listed for sale by the 'owner' 
     * at a 'price'
     */
    event TokenListing(uint256 tokenId, address owner, uint256 price);


    /**
     * @dev Emitted when a 'tokenId' is purchased by the 'buyer' from 
     * the 'seller' at a 'price'
     */
    event Sale(uint256 tokenId, address seller, address buyer, uint256 price);


    /**
     * @notice Allows 'tokenId' owners to list tokens for sale at a 'price'
     * @dev Throws if:
     * - 'msg.sender' is not the owner of the 'tokenId'
     * - 'price' is equal to zero
     * @param tokenId The token identifier
     * @param price The listing price of the token
     *
     * Emits a 'TokenListing' event
     */
    function listTokenForSale(uint256 tokenId, uint256 price) external;


    /**
     * @notice Allows users to purchase listed tokens
     * @dev This function is payable as it accepts payments. 
     * Throws if:
     * - 'tokenId' is not listed for sale
     * - 'msg.value' is different to the listing price
     * - 'purchaser' is the zero address
     * - 'msg.sender' is different to the 'purchaser'
     * @param tokenId The token identifier
     * @param purchaser The address of the buyer
     *
     * Emits a 'Sale' event
     */
    function purchaseToken(uint256 tokenId, address purchaser) external payable;


    /**
     * @notice Returns the sale price of a listed token
     * @param tokenId The token identifier
     * @return bool 'true' if the 'tokenId' is listed for sale, 'false' otherwise
     * @return uint256 the price if 'tokenId' is listed for sale, zero otherwise
     */
    function getSalePrice(uint256 tokenId) external returns(bool, uint256);

}