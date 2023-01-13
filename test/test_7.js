require('dotenv').config();
const NFTicket = artifacts.require('NFTicket');

const { 
    MINT_PRICE,
    ROYALTY
} = process.env;


contract('NFTicket', async(accounts) => {

    let ticket_contract;
    let owner = accounts[0];
    let supply = 0;
    let mint_price = MINT_PRICE.toString();

    before(async() => {
        ticket_contract = await NFTicket.deployed();
    });

      // ////////////////////////////////// //
     // Enforced royalties (optional) TEST //
    // ////////////////////////////////// //
    describe('ENFORCE ROYALTIES', async() => { 

        it('setting: token creation', async() => {

            await ticket_contract.openMint({ from: owner });

            await ticket_contract.mint(accounts[1], 1, {
                from: accounts[1], value: web3.utils.toWei(mint_price, 'ether')
            });

            supply += await ticket_contract.totalSupply();
            supply = Number.parseInt(supply);

            assert.equal(1, supply);

        });


        it('setting: token listing for sale', async() => {

            let tokenId = 1;

            await ticket_contract.listTokenForSale(tokenId, web3.utils.toWei(mint_price, 'ether'), {
                from: accounts[1]
            });

            let sale_data = await ticket_contract.getSalePrice(tokenId);

            assert.equal(true, sale_data[0]);
            assert.equal(web3.utils.toWei(mint_price, 'ether'), sale_data[1]);

        });


        it('enforces royalty payment', async() => {

            let result;
            let tokenId = 1;

            let owner_bal_prev = BigInt(await web3.eth.getBalance(owner));

            let price = BigInt(web3.utils.toWei(mint_price, 'ether'));
            let royalties = (BigInt(ROYALTY) * price) / BigInt(100);
            let total_payment = price + royalties;

            try {
                // This should fail because no royalties are included in the tx
                await ticket_contract.purchaseToken(tokenId, accounts[2], {
                    from: accounts[2], value: web3.utils.toWei(mint_price, 'ether')
                }); 
            } catch(err) {
                try {
                    // This transaction includes price and royalties
                    await ticket_contract.purchaseToken(tokenId, accounts[2], {
                        from: accounts[2], value: total_payment.toString()
                    }); 

                    result = 'success';
                } catch(err) {
                    result = 'fail';
                }
            }

            let tk_owner = await ticket_contract.ownerOf(tokenId);

            let owner_bal_aft = BigInt(await web3.eth.getBalance(owner));
            let royalty_received = owner_bal_aft - owner_bal_prev;

            assert.equal(accounts[2], tk_owner);
            assert.equal('success', result);
            assert.equal(royalties, royalty_received);

        });



    });

});
