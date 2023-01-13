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
     // SCT-SL //
    // ////// //
    describe('SALE', async() => {

        // SCT-SL-00
        it('setting: token creation', async() => {
            
            await ticket_contract.openMint({ from: owner });

            await ticket_contract.mint(accounts[1], 1, {
                from: accounts[1], value: web3.utils.toWei(mint_price, 'ether')
            });

            await ticket_contract.mint(accounts[2], 1, {
                from: accounts[2], value: web3.utils.toWei(mint_price, 'ether')
            });

            supply += await ticket_contract.totalSupply();
            supply = Number.parseInt(supply);

            assert.equal(2, supply);
        });


        // SCT-SL-01
        it('lists tokens', async() => {

            let tokenId = 1;

            await ticket_contract.listTokenForSale(tokenId, web3.utils.toWei(mint_price, 'ether'), {
                from: accounts[1]
            })
            .then(async function(tx) {
                // console.log(tx.logs[0].event);
                assert.equal('TokenListing', tx.logs[0].event);
            });

            let sale_data = await ticket_contract.getSalePrice(tokenId);
            let wrong_sale_data = await ticket_contract.getSalePrice(2);

            assert.equal(true, sale_data[0]);
            assert.equal(web3.utils.toWei(mint_price, 'ether'), sale_data[1]);

            assert.equal(false, wrong_sale_data[0]);
            assert.equal(0, wrong_sale_data[1]);

        });


        // SCT-SL-02
        it('transfers ownership through sale', async() => {

            let tokenId = 1;
            let sale_data = await ticket_contract.getSalePrice(tokenId);

            let wrong_value = BigInt(sale_data[1]) - BigInt(1)

            try {
                await ticket_contract.purchaseToken(tokenId, accounts[2], {
                    from: accounts[2], value: wrong_value
                });                
            } catch(err) {
                await ticket_contract.purchaseToken(tokenId, accounts[2], {
                    from: accounts[2], value: sale_data[1]
                })
                .then(async function(tx) {
                    // console.log(tx.logs[0].event);
                    assert.equal('Transfer', tx.logs[0].event);
                    assert.equal('Sale', tx.logs[1].event);
                });
            }

            let balance_1 = await ticket_contract.balanceOf(accounts[1]);
            let balance_2 = await ticket_contract.balanceOf(accounts[2]);

            assert.equal(0, balance_1);
            assert.equal(2, balance_2);

            let tk_0_add_1;
            let tk_0_add_2;
            let tk_1_add_2;

            try {
                tk_0_add_1 = await ticket_contract.tokenOfOwnerByIndex(accounts[1], 0);
            } catch(err) {
                tk_0_add_2 = await ticket_contract.tokenOfOwnerByIndex(accounts[2], 0); // 2
                tk_1_add_2 = await ticket_contract.tokenOfOwnerByIndex(accounts[2], 1); // 1
            }
            
            assert.equal(2, tk_0_add_2);
            assert.equal(1, tk_1_add_2);

        });


        // SCT-SL-03
        it('updates ether balances', async() => {

            let tokenId = 1;
            let gas_used;
            let gas_price;
            let gas_costs;
            
            await ticket_contract.listTokenForSale(tokenId, web3.utils.toWei(mint_price, 'ether'), {
                from: accounts[2]
            })
            .then(async function(tx) {
                // console.log(tx.logs[0].event);
                assert.equal('TokenListing', tx.logs[0].event);
            });

            let balance_owner_prev = BigInt(await web3.eth.getBalance(accounts[2]));
            let balance_buyer_prev = BigInt(await web3.eth.getBalance(accounts[3]));

            let sale_data = await ticket_contract.getSalePrice(tokenId);
            gas_price = await web3.eth.getGasPrice();

            await ticket_contract.purchaseToken(tokenId, accounts[3], {
                from: accounts[3], value: sale_data[1], gasPrice: gas_price
            })
            .then(async function(tx) {
                gas_used = tx.receipt.gasUsed;
                gas_costs = BigInt(gas_used * gas_price);
            });

            let balance_owner_aft = BigInt(await web3.eth.getBalance(accounts[2]));
            let balance_buyer_aft = BigInt(await web3.eth.getBalance(accounts[3]));

            let expected_bal_owner = balance_owner_prev + BigInt(sale_data[1]);
            let expected_bal_buyer = balance_buyer_prev - BigInt(sale_data[1]) - gas_costs;

            assert.equal(expected_bal_owner, balance_owner_aft);
            assert.equal(expected_bal_buyer, balance_buyer_aft);

        });

        // SCT-SL-04
        it('reverts if token listing over mint price', async() => {
            
            let result;
            let tokenId = 1;
            let token_owner = await ticket_contract.ownerOf(tokenId);

            assert.equal(accounts[3], token_owner);

            try {
                await ticket_contract.listTokenForSale(tokenId, web3.utils.toWei(MINT_PRICE + 0.1, 'ether'), {
                    from: token_owner
                })
            } catch(err) {
                result = 'success';
            }
            
            assert.equal('success', result);
        });

        // SCT-SL-05
        it('reverts when listing from non tokenId owner', async() => {

            let result;
            let tokenId = 1;
            let token_owner = await ticket_contract.ownerOf(tokenId);

            assert.equal(accounts[3], token_owner);

            try {
                await ticket_contract.listTokenForSale(tokenId, web3.utils.toWei(MINT_PRICE, 'ether'), {
                    from: accounts[4]
                })
            } catch(err) {
                result = 'success';
            }

            assert.equal('success', result);
        });

    });

});