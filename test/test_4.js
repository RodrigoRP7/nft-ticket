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
     // SCT-W //
    // ///// //
    describe('WITHDRAW', async() => { 

        // SCT-WD-00
        it('funds contract', async() => {
           
            let double_mint_price = 2 * MINT_PRICE;

            await ticket_contract.openMint({ from: owner });

            // Mint tokens to fund the contract
            await ticket_contract.mint(accounts[1], 2, {
                from: accounts[1], 
                value: web3.utils.toWei(double_mint_price.toString(), 'ether')
            });

            await ticket_contract.mint(accounts[2], 2, {
                from: accounts[2], 
                value: web3.utils.toWei(double_mint_price.toString(), 'ether')
            });

            // Balance of the contract must have updated
            let balance_contract = await web3.eth.getBalance(ticket_contract.address);
            balance_contract = balance_contract.toString();

            assert.equal(web3.utils.toWei('4'), balance_contract);
        });


        // SCT-WD-01
        it('withdraws funds to owner address', async() => {

            let gas_used;
            let gas_price;
            let gas_costs;
           
            let balance_owner_prev = BigInt(await web3.eth.getBalance(owner));
            let balance_contract = await web3.eth.getBalance(ticket_contract.address);
            
            gas_price = await web3.eth.getGasPrice();

            await ticket_contract.withdrawFunds({ from: owner, gasPrice: gas_price })
            .then(async function(tx) {
                gas_used = tx.receipt.gasUsed;
                gas_costs = BigInt(gas_price * gas_used);
                // console.log(gas_price, gas_used, gas_costs)
            })

            // withdrawFunds has associated gas costs
            let balance_owner_aft = BigInt(await web3.eth.getBalance(owner));
            let withdrawn = (balance_owner_aft - balance_owner_prev) + gas_costs;

            assert.equal(balance_contract, withdrawn);
        });

        // SCT-WD-02
        it('reverts withdrawal attempts from non contract owner', async() => {
            let result;
        
            try {
                await ticket_contract.withdrawFunds({ from: accounts[3] })
            } catch(err) {
                result = 'success';
                // console.log(err);
            }
        
            assert.equal('success', result);
        });
        

    });

});