const NFTicket = artifacts.require("NFTicket");

module.exports = function(deployer) {
  require('dotenv').config();
  
  const { 
    BASE_URI,
    MAX_SUPPLY,
    MAX_TK_PER_ADDRESS,
    NAME,
    SYMBOL,
    MINT_PRICE, 
  } = process.env;

  deployer.deploy(NFTicket, NAME, SYMBOL, BASE_URI, MAX_SUPPLY, web3.utils.toWei(MINT_PRICE.toString(), 'ether'), MAX_TK_PER_ADDRESS);
};
