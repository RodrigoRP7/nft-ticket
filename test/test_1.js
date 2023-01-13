require('dotenv').config();
const NFTicket = artifacts.require('NFTicket');

const { 
    BASE_URI,
    MAX_SUPPLY,
    MAX_TK_PER_ADDRESS,
    NAME,
    SYMBOL,
    MINT_PRICE 
} = process.env;

contract('NFTicket', async(accounts) => {

    let ticket_contract;
    let owner = accounts[0];
    let mint_price = MINT_PRICE.toString();

    before(async() => {
        ticket_contract = await NFTicket.deployed();
    });

      // ////// //
     // SCT-ST //
    // ////// //
    describe('SETTINGS', async() => {

        // SCT-ST-01
        it('deploys contract successfully', async() => {
            const address = await ticket_contract.address;

            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
            assert.notEqual(address, 0x0);
        });

        // SCT-ST-02
        it('sets collection name', async() => {
            let name = await ticket_contract.name();

            assert.equal(NAME, name);
        });


        // SCT-ST-03
        it('sets collection symbol', async() => {
            let symbol = await ticket_contract.symbol();

            assert.equal(SYMBOL, symbol);
        });


        // SCT-ST-04
        it('sets base URI', async() => {
            // Must mint a token
            await ticket_contract.openMint({ from: owner });
            let total_value = 2 * MINT_PRICE;
            await ticket_contract.mint(accounts[1], 2, { from: accounts[1], value: web3.utils.toWei(total_value.toString(), 'ether')});

            // Get metadata
            let tokenURI_1 = await ticket_contract.tokenURI(1);
            let tokenURI_2 = await ticket_contract.tokenURI(2);

            assert.equal(BASE_URI.concat('1.json'), tokenURI_1);
            assert.equal(BASE_URI.concat('2.json'), tokenURI_2);
        });


        // SCT-ST-05
        it('sets contract owner', async() => {
            let contract_owner = await ticket_contract.owner();

            assert.equal(owner, contract_owner);
        });


        // SCT-ST-06
        it('sets royalty info', async() => {
            let royaltyInfo = await ticket_contract.royaltyInfo(0, 1000);

            // royaltyInfo returns address of receiver [0] and amount [1]
            assert.equal(50, royaltyInfo[1]);
        });

        
        // SCT-ST-07
        it('sets mint price', async() => {
            let price = await ticket_contract.getMintPrice();

            // Minting price should be 1 ether
            assert.equal(web3.utils.toWei(mint_price, 'ether'), price);
        });


        // SCT-ST-08
        it('sets max tokens per address', async() => {
            let max_tokens = await ticket_contract.getMaxTokensPerAddress();

            assert.equal(MAX_TK_PER_ADDRESS, max_tokens);
        });


        // SCT-ST-09
        it('sets max supply', async() => {
            let max_supply = await ticket_contract.maxSupply();

            assert.equal(MAX_SUPPLY, max_supply);
        });


        it('supports all interfaces', async() => {
            // ERC721       -> 0x80ac58cd
            // ERC721 Meta  -> 0x5b5e139f
            // ERC721 Enum  -> 0x780e9d63
            // ERC165       -> 0x01ffc9a7
            // ERC173       -> 0x7f5828d0
            // ERC2981      -> 0x2a55205a
            let interfaces = [
                '0x80ac58cd', 
                '0x5b5e139f', 
                '0x780e9d63',
                '0x01ffc9a7',
                '0x7f5828d0',
                '0x2a55205a'
            ];
            
            for(let i = 0; i < interfaces.length; i++) {
                let is_supported = await ticket_contract.supportsInterface(interfaces[i]);

                assert.equal(true, is_supported);
            }

        });

  });
  


})
