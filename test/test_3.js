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

      // ///// //
     // SCT-T //
    // ///// //
    describe('TRANSFER', async() => {

        // SCT-T-01
        it('transfers token between addresses', async() => {
            // First open mint from owner account
            await ticket_contract.openMint({ from: owner });
            let double_mint_price = 2 * MINT_PRICE;
            
            // Mint tokens
            await ticket_contract.mint(accounts[1], 2, { 
                from: accounts[1], 
                value: web3.utils.toWei(double_mint_price.toString(), 'ether')
            });
            await ticket_contract.mint(accounts[2], 1, { 
                from: accounts[2], value: web3.utils.toWei(mint_price, 'ether')
            });

            let balance_1 = await ticket_contract.balanceOf(accounts[1]);
            let balance_2 = await ticket_contract.balanceOf(accounts[2]);

            supply += await ticket_contract.totalSupply();
            supply = Number.parseInt(supply);

            assert(2, balance_1);
            assert(1, balance_2);
            assert(3, supply);
    
            // Transfer tokens
            await ticket_contract.safeTransferFrom(accounts[1], accounts[2], 1, {
                from: accounts[1]
            });
            await ticket_contract.safeTransferFrom(accounts[1], accounts[3], 2, {
                from: accounts[1]
            });
            
            // SCT-T-02 -> Updates balances
            balance_1 = await ticket_contract.balanceOf(accounts[1]);
            balance_2 = await ticket_contract.balanceOf(accounts[2]);
            let balance_3 = await ticket_contract.balanceOf(accounts[3]);

            assert.equal(0, balance_1);
            assert.equal(2, balance_2);
            assert.equal(1, balance_3);
        });


        // SCT-T-03
        it('updates token of owner by index', async() => {
            let tok_0_add_1;
            let tok_0_add_2;
            let tok_1_add_2;
            let tok_0_add_3;

            try {
                tok_0_add_1 = await ticket_contract.tokenOfOwnerByIndex(accounts[1], 0);
            } catch(err) {
                tok_0_add_2 = await ticket_contract.tokenOfOwnerByIndex(accounts[2], 0); // 3
                tok_1_add_2 = await ticket_contract.tokenOfOwnerByIndex(accounts[2], 1); // 1
                tok_0_add_3 = await ticket_contract.tokenOfOwnerByIndex(accounts[3], 0); // 2
            }

            assert.equal(3, tok_0_add_2);
            assert.equal(1, tok_1_add_2);
            assert.equal(2, tok_0_add_3);
        });


        // SCT-T-04
        it('reverts transfers from non-owner of tokenId', async() => {
            let result;

            try {
                // accounts[2] owns tokenId 3, accounts[4] must not be able to transfer to itself
                await ticket_contract.safeTransferFrom(accounts[2], accounts[4], 3, {
                    from: accounts[4]
                });
            } catch(err) {
                result = 'success';
                // console.log(err)
            }

            assert.equal('success', result);
        });
        
  });

     // ///// //
    // SCT-A //
   // ///// //
  describe('ALLOWANCE', async() => { 

    // SCT-A-01
    it('approves a third-party address', async() => {

        await ticket_contract.approve(accounts[4], 3, {
            from: accounts[2]
        })

        let approved_address = await ticket_contract.getApproved(3);

        assert.equal(accounts[4], approved_address);
    });


    // SCT-A-02
    it('approves an operator', async() => {

        await ticket_contract.setApprovalForAll(accounts[5], true, {
            from: accounts[2]
        });

        let approved_operator = await ticket_contract.isApprovedForAll(accounts[2], accounts[5]);
        let non_approved_operator = await ticket_contract.isApprovedForAll(accounts[2], accounts[4]);

        assert.equal(true, approved_operator);
        assert.equal(false, non_approved_operator);
    });


    // SCT-A-03
    it('reverts non-owner approval calls', async() => {
        let result;

        try {
            // Token id 2 is owned by accounts[3]
            await ticket_contract.approve(accounts[4], 2, {
                from: accounts[4]
            });
        } catch(err) {
            result = 'success';
        }

        let non_approved_address = await ticket_contract.getApproved(2);

        assert.equal('success', result);
        assert.equal(0x0, non_approved_address);
    });


    // SCT-A-04
    it('transfers token id from operator call', async() => {

        // accounts[5] is operator for accounts[2]
        // accounts[2] owns tokens 1 and 3
        await ticket_contract.safeTransferFrom(accounts[2], accounts[5], 1, {
            from: accounts[5]
        });

        await ticket_contract.safeTransferFrom(accounts[2], accounts[6], 3, {
            from: accounts[5]
        });

        // accounts[5] transfers to itself and to accounts[6]
        let balance_5 = await ticket_contract.balanceOf(accounts[5]);
        let balance_6 = await ticket_contract.balanceOf(accounts[6]);
        let balance_2 = await ticket_contract.balanceOf(accounts[2]);

        let tok_0_add_5 = await ticket_contract.tokenOfOwnerByIndex(accounts[5], 0); // 1
        let tok_0_add_6 = await ticket_contract.tokenOfOwnerByIndex(accounts[6], 0); // 3

        assert.equal(0, balance_2);
        assert.equal(1, balance_5);
        assert.equal(1, balance_6);

        assert.equal(1, tok_0_add_5);
        assert.equal(3, tok_0_add_6);
    });


    // SCT-A-05
    it('removes approved addresses after transfer', async() => {
        await ticket_contract.approve(accounts[2], 3, {
            from: accounts[6]
        });

        let approved_address = await ticket_contract.getApproved(3);

        // Assert the approved address has been approved
        assert.equal(accounts[2], approved_address);

        // Owner transfers token to another address
        await ticket_contract.safeTransferFrom(accounts[6], accounts[7], 3, {
            from: accounts[6]
        });

        let non_approved_address = await ticket_contract.getApproved(3);

        assert.equal(0x0, non_approved_address);
       
    });
    

    // SCT-A-06
    it('disapproves an operator', async() => {

        // Operator approval
        await ticket_contract.setApprovalForAll(accounts[1], true, {
            from: accounts[3]
        });

        let approved_operator = await ticket_contract.isApprovedForAll(accounts[3], accounts[1]);

        assert.equal(true, approved_operator);

        // Operator disapproval
        await ticket_contract.setApprovalForAll(accounts[1], false, {
            from: accounts[3]
        });

        let non_approved_operator = await ticket_contract.isApprovedForAll(accounts[3], accounts[1]);

        assert.equal(false, non_approved_operator);
       
    });


  });

});
