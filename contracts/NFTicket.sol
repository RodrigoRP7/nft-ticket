// SPDX-License-Identifier: MIT
// Developed by: Archivist (version: v0.1)
pragma solidity ^0.8.0;

import "./scm-implementations/scm-09.sol";
import "./scm-implementations/scm-07-02.sol";
import "./token/common/ERC2981.sol";
import "./token/ERC721/extensions/ERC721Enumerable.sol";

contract NFTicket is SaleNFT, ERC2981, DynamicMetadata {

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 maxSupply, 
        uint256 mintPrice,
        uint256 maxTokensPerAddress
    ) ERC721(name, symbol)
      MintCapped(maxSupply, mintPrice, maxTokensPerAddress)
      DynamicMetadata(baseURI)
    {
      _setDefaultRoyalty(_msgSender(), 500);
    }

    /*
     * { IERC165 } - supportsInterface ().
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(MintCapped, ERC2981, DynamicMetadata) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /*
     * { IERC721Metadata } - tokenURI() 
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, DynamicMetadata) returns (string memory) {
        return super.tokenURI(tokenId);
    }
  
    /*
     * { } - Restricted function to withdraw funds from the contract
     */
    function withdrawFunds() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * { ISaleNFT } - purchaseToken()
     * @dev This funcion overrides the 'purchaseToken' function in { ISaleNFT } implementation
     * contract to add enforced royalty functionality.
     *
     * @dev This implementation uses the ERC2981 standard, but this is only an informational interface for royalty
     * payments. This function allows to enforce royalties when implementing the module { ISaleNFT } as well as the
     * ERC2981 standard. To make this functionality available, uncomment the code within this function.
     */
    function purchaseToken(uint256 tokenId, address purchaser) public override payable {
        // (bool forSale, uint256 salePrice) = getSalePrice(tokenId);
        // require(forSale, "This tokenId is not for sale");
        // (address receiver, uint256 royaltyAmount) = royaltyInfo(tokenId, salePrice);

        // uint256 totalPayment = salePrice + royaltyAmount;
        // require(msg.value == totalPayment, "Payment must include sale price and royalties");

        super.purchaseToken(tokenId, purchaser);

        // (bool success, ) = payable(receiver).call{value: royaltyAmount}("");
        // require(success, "The transaction failed");
    }

    /*
     * { } - Internal function to query the metadata base URI
     */
    function _baseURI() internal view override(ERC721, DynamicMetadata) returns (string memory) {
        return super._baseURI();
    }    

    /*
     * { } - Hook called from ERC721 and ERC721Enumerable before any ownership transfer
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Enumerable, ERC721) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
   

}