require('dotenv').config();
const NFTicket = artifacts.require('NFTicket');

const { 
    BASE_URI,
    MAX_SUPPLY,
    MAX_TK_PER_ADDRESS,
    MINT_PRICE 
} = process.env;


contract('NFTicket', async(accounts) => {

    let ticket_contract;
    let owner = accounts[0];
    let supply = 0;
    let mint_price = MINT_PRICE.toString();

    before(async() => {
        ticket_contract = await NFTicket.deployed();
    });

      // ////// //
     // SCT-MI //
    // ////// //
    describe('MINTING', async() => {

        // SCT-MI-01
        it('mints new tokens', async() => {
            // First open mint from owner account
            await ticket_contract.openMint({ from: owner });
            let double_mint_price = 2 * MINT_PRICE;
            
            // Mint tokens from different accounts
            await ticket_contract.mint(accounts[1], 2, { 
                from: accounts[1], 
                value: web3.utils.toWei(double_mint_price.toString(), 'ether')
            });
            await ticket_contract.mint(accounts[2], 2, { 
                from: accounts[2], 
                value: web3.utils.toWei(double_mint_price.toString(), 'ether')
            });

            supply = await ticket_contract.totalSupply();
            supply = Number.parseInt(supply);
            
            assert.equal(4, supply);
        });


        // SCT-MI-02
        it('updates balances', async() => {
            let balance_1 = await ticket_contract.balanceOf(accounts[1]);
            let balance_2 = await ticket_contract.balanceOf(accounts[2]);
            
            assert.equal(2, balance_1);
            assert.equal(2, balance_2);
        });


        // SCT-MI-03
        it('reverts when paused', async() => {
            await ticket_contract.closeMint({ from: owner });
            let result;

            try {
                await ticket_contract.mint(accounts[3], 1, { 
                    from: accounts[3], 
                    value: web3.utils.toWei(mint_price, 'ether')
                });
            } catch(err) {
                result = 'success';
            }
 
            assert.equal('success', result);
        });


        // SCT-MI-04
        it('reverts when tokens per address exceeded', async() => {
            await ticket_contract.openMint({ from: owner });
            let result;
            
            try {
                // accounts[2] has minted 2 tokens
                await ticket_contract.mint(accounts[2], 1, { 
                    from: accounts[2], 
                    value: web3.utils.toWei(mint_price, 'ether')
                });
            } catch(err) {
                result = 'success';
                // console.log(err);
            }

            assert.equal('success', result);
        });


        // SCT-MI-05
        it('reverts when insufficient tx value', async() => {
            let result;
            let insufficient_val = MINT_PRICE - 0.1;
            
            try {
                await ticket_contract.mint(accounts[1], 1, { 
                    from: accounts[1], 
                    value: web3.utils.toWei(insufficient_val, 'ether')
                });
            } catch(err) {
                result = 'success';
                // console.log(err)
            }

            assert.equal('success', result);
        });


        // SCT-MI-06
        it('reverts when max supply exceeded', async() => {
            let result;
            let address_index = 3;
            let mint_per_address = 2;
            let remaining = MAX_SUPPLY - supply;
            let double_mint_price = 2 * MINT_PRICE;
            
            try {
                // Attempts to mint over the maximum supply
                for(let i = 0; i < (remaining / mint_per_address) + 1; i++) {
                    await ticket_contract.mint(accounts[address_index], 2, { 
                        from: accounts[address_index], 
                        value: web3.utils.toWei(double_mint_price.toString(), 'ether')
                    });
                    address_index ++;
                    supply += mint_per_address;
                }

                result = 'fail';
            } catch(err) {
                result = 'success';
                console.log(`Stopped at supply ${supply} with max supply ${MAX_SUPPLY}`);
            }

            assert.equal('success', result);
        });


        // SCT-MI-07
        it('updates total supply', async() => {
           let updated_supply = await ticket_contract.totalSupply();

           assert.equal(MAX_SUPPLY, updated_supply);
        });


        // SCT-MI-08
        it('updates token by index', async() => {
            let token_ids = [];

            for(let i = 0; i < 4; i++) {
                let id = await ticket_contract.tokenByIndex(i);
                token_ids.push(id);

                assert.equal(i + 1, token_ids[i])
            }
        });


        // SCT-MI-09
        it('updates token of owner by index', async() => {
            let result;

            for(let i = 1; i < 5; i++) {
                result = 'fail';
   
                let id_0 = await ticket_contract.tokenOfOwnerByIndex(accounts[i], 0); 
                let id_1 = await ticket_contract.tokenOfOwnerByIndex(accounts[i], 1);

                // Should revert when index is out of bounds
                try {
                    let id_2 = await ticket_contract.tokenOfOwnerByIndex(accounts[i], 2);
                } catch(err) {
                    result = 'success';
                }

                assert.equal('success', result);
                assert.equal(2 * i - 1, id_0);
                assert.equal(2 * i, id_1);
            }
        });


        // SCT-MI-10
        it('token metadata URI', async() => {

            for(let i = 1; i < 5; i++) {
                let token_uri = await ticket_contract.tokenURI(i);
                
                let TOKEN_URI = BASE_URI.concat(`${i}.json`);

                assert.equal(TOKEN_URI, token_uri);
            }
        });

  });


});
