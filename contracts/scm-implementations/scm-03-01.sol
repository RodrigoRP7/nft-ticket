// SPDX-License-Identifier: MIT
// Developed by: Archivist (version: v0.1)
pragma solidity ^0.8.0;

/**
 * @dev Implementation of the { IMintCapped } interface
 *
 * This implementation uses ERC-721 Enumerable
 */

import "../scm-interfaces/iscm-03-01.sol";
import "../access/Ownable.sol";
import "../token/ERC721/extensions/ERC721Enumerable.sol";


abstract contract MintCapped is ERC721Enumerable, Ownable, IMintCapped {    
    
    // Maximum supply of tokens
    uint256 private _maxSupply;

    // Optional variables
    uint256 private _maxTokensPerAddress;
    uint256 private _mintPrice;

    // Mint functions access control
    bool private _isMintOpen;

    constructor(uint256 maxSupply_, uint256 mintPrice_, uint256 maxTokensPerAddress_) {
        _maxSupply = maxSupply_;
        _mintPrice = mintPrice_;
        _maxTokensPerAddress = maxTokensPerAddress_;

        _isMintOpen = false;
    }

    // Function modifier to manage minting access control
    modifier onlyIfOpen() {
        require(_isMintOpen, "Mint is not available");
        _;
    }

    // Functions to open and close mint
    function openMint() public onlyOwner { _isMintOpen = true; }
    function closeMint() public onlyOwner { _isMintOpen = false; }

    // Functions to get the minting data
    function getMintPrice() public view returns(uint256) { return _mintPrice; }
    function getMaxTokensPerAddress() public view returns(uint256) { return _maxTokensPerAddress; }

    /*
     * { IMintCapped } - mint()
     */
    function mint(address to, uint256 numTokens) public payable onlyIfOpen {
        uint256 supply = totalSupply();
        require(to == _msgSender(), "Caller must be the to address");
        require(supply + numTokens <= _maxSupply, "Maximum supply exceeded");
        require(msg.value == numTokens * _mintPrice, "Insufficient transaction value");
        require(balanceOf(_msgSender()) + numTokens <= _maxTokensPerAddress, "Allowed tokens per address exceeded");

        for(uint i = 1; i <= numTokens; i++) {
            _safeMint(to, supply + i);
        }
    }

    /*
     * { IMintCapped } - maxSupply()
     */
    function maxSupply() public view returns(uint256) {
        return _maxSupply;
    }

    /**
     * @dev This funcion overrides Ownable, which is an implementation for the ERC173 standard. The name has not
     * been modified as this module is mostly recognized by this name instead of the ERC standard it represents. 
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, Ownable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}