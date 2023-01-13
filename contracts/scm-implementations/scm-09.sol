// SPDX-License-Identifier: MIT
// Developed by: Archivist (version: v0.1)
pragma solidity ^0.8.0;

/**
 * @dev Implementation of the { ISaleNFT } interface
 *
 * This contract extends the ERC-721 functionality. Check { ISaleNFT }
 * specification for detailed information about this contract.
 */

import "../scm-interfaces/iscm-09.sol";
import "./scm-03-01.sol";
import "../token/ERC721/ERC721.sol";

abstract contract SaleNFT is MintCapped, ISaleNFT {

    // Items for sale data
    struct SaleItem {
        uint256 price;
    }

    // Maps tokenIds to items for sale
    mapping(uint256 => SaleItem) private _saleItems;

    /*
     * {ISaleNFT} - listTokenForSale()
     */
    function listTokenForSale(uint256 tokenId, uint256 _price) public virtual override {
        _requireMinted(tokenId);
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Caller must be the owner or approved address of tokenId");
        require(_price > 0, "Sale price cannot be zero");

        // Extra condition to prevent resales
        uint256 mintPrice = getMintPrice();
        require(_price <= mintPrice, "Token sale over mint price is not allowed");

        _saleItems[tokenId].price = _price;

        emit TokenListing(tokenId, _msgSender(), _price);
    }

    /*
     * {ISaleNFT} - purchaseToken()
     */
    function purchaseToken(uint256 tokenId, address purchaser) public virtual override payable {
        require(_saleItems[tokenId].price > 0, "This item is not for sale");
        require(purchaser != address(0), "Purchaser cannot be the zero address");
        require(_msgSender() == purchaser, "Caller must be the token purchaser");
        require(msg.value >= _saleItems[tokenId].price, "Transaction value is not equal to the token sale price");

        address owner = ownerOf(tokenId);
        uint256 price = _saleItems[tokenId].price;

        _saleItems[tokenId].price = 0;

        _safeTransfer(owner, purchaser, tokenId, "");
        (bool success, ) = payable(owner).call{value: price}("");
        require(success, "The transaction failed");

        emit Sale(tokenId, owner, purchaser, price);
    }

    /*
     * {ISaleNFT} - getSalePrice()
     */
    function getSalePrice(uint256 tokenId) public view virtual override returns(bool, uint256) {
        if(_saleItems[tokenId].price != 0) {
            return (true, _saleItems[tokenId].price);
        } else {
            return(false, 0);
        }
    }

}