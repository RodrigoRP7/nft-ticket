require('dotenv').config();
const NFTicket = artifacts.require('NFTicket');

const { 
    BASE_URI,
    UPDATED_BASE_URI,
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

      // ///// //
     // SCT-V //
    // ///// //
    describe('VISUALIZATION', async() => {

        // SCT-V-00
        it('setting: token creation', async() => { 
            
            let double_mint_price = 2 * MINT_PRICE;

            await ticket_contract.openMint({ from: owner });

            await ticket_contract.mint(accounts[1], 2, {
                from: accounts[1], value: web3.utils.toWei(double_mint_price.toString(), 'ether')
            });

            await ticket_contract.mint(accounts[2], 2, {
                from: accounts[2], value: web3.utils.toWei(double_mint_price.toString(), 'ether')
            });

            supply += await ticket_contract.totalSupply();
            supply = Number.parseInt(supply);

            assert.equal(4, supply);

        });

        // SCT-V-01
        it('returns ownership by tokenId', async() => { 

            let owner_id_1 = await ticket_contract.ownerOf(1);
            let owner_id_2 = await ticket_contract.ownerOf(2);
            let owner_id_3 = await ticket_contract.ownerOf(3);
            let owner_id_4 = await ticket_contract.ownerOf(4);

            assert.equal(accounts[1], owner_id_1);
            assert.equal(accounts[1], owner_id_2);
            assert.equal(accounts[2], owner_id_3);
            assert.equal(accounts[2], owner_id_4);
        });


        // SCT-V-02
        it('returns metadata by tokenId', async() => { 

            let token_uri;

            for(let i = 1; i <= supply; i++) {
                token_uri = await ticket_contract.tokenURI(i);
                assert.equal(BASE_URI.concat(`${i}.json`), token_uri);
            }
        });
    
    });


      // ////// //
     // SCT-ME //
    // ////// //
    describe('METADATA', async() => { 

        // SCT-ME-01
        it('modifies base uri by contract owner', async() => {

            let token_uri;

            await ticket_contract.updateBaseURI(UPDATED_BASE_URI, {
                from: owner
            });

            for(let i = 1; i <= supply; i++) {
                token_uri = await ticket_contract.tokenURI(i);
                assert.equal(UPDATED_BASE_URI.concat(`${i}.json`), token_uri);
            }

        });

        // SCT-ME-02
        it('reverts metadata updates from non owner calls', async() => {

            let result;

            try {
                await ticket_contract.updateBaseURI(BASE_URI, {
                    from: accounts[3]
                });
            } catch(err) {
                result = 'success';
            }
            
            assert.equal('success', result);
        });

    });

});