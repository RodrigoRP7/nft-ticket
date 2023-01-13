// SPDX-License-Identifier: MIT
// Developed by: Archivist (version: v0.1)
pragma solidity ^0.8.0;

/**
 * @dev Implementation of the { IDynamicMetadata } interface
 *
 * This implementation uses a single contract owner for access control. 
 * However, different implementations may include role-based access control
 * or others. Be sure to restrict any public/external function with capacity
 * to modifiy the contract state.
 *
 * This contract can be fully decentralized by leaving 'updateBaseURI'
 * unimplemented. Smart contract events may trigger the '_updateBaseURI' 
 * function to autonomously update the base URI to a new state.
 */

import "../scm-interfaces/iscm-07-02.sol";
import "../token/ERC721/ERC721.sol";
import "../access/Ownable.sol";
import "../utils/Strings.sol";

abstract contract DynamicMetadata is ERC721, Ownable, IDynamicMetadata {

    using Strings for uint256;

    // Metadata base URI
    string private _BaseURI;

    // Initilization of the base URI
    constructor(string memory baseURI_) {
        _updateBaseURI(baseURI_);
    }

    /**
     * { IERC721Metadata } - tokenURI()
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    /**
     * @dev Overrides the function implemented in ERC721 with Metadata extension
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _BaseURI;
    }

    /*
     * { IDynamicMetadata } - updateBaseURI()
     */
    function updateBaseURI(string memory newURI) public virtual override onlyOwner {
        _updateBaseURI(newURI);
    }

    /*
     * {} - Internal function to manage metadata base URI updates
     */
    function _updateBaseURI(string memory newURI) internal {
        _BaseURI = newURI;
    }

    /*
     * { IERC165 } - supportsInterface()
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, Ownable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}