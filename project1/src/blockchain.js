/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
        console.log("Blockchain constructor invoked");
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
           try {
               // validate the chain first
               const errorLog = await self.validateChain();
               if (errorLog != null && errorLog.length != 0)  {
                   resolve({message: "Failed validation while adding a block", error: errorLog, status: false});
               }


               // check to see if genesis block needs to be added
               if (self.height === -1) {
                   block.previousBlockHash = null;
               } else {
                   // at this time chain's height has not been increased
                   // self.height yields the index of the previous block
                   block.previousBlockHash = self.chain[self.height].hash;
               }

               // assign the timestamp
               block.time = new Date().getTime().toString().slice(0,-3);
               
               //  update the block's height
               block.height = self.chain.length;
               console.log('self.height = ' + self.height);
               console.log('self.chain.length = ' + self.chain.length);

               // update the block's hash
               block.hash = SHA256(JSON.stringify(block)).toString();

               // add the block to the chain
               self.chain.push(block);

               // update the chain's height
               self.height = self.height + 1;

               resolve(block);
           } catch (error) {
               console.log('oops error');
               reject(error);
           }
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            console.log('inside requestMessageOwnershipVerification');
            // <WALLET_ADDRESS>:${new Date().getTime().toString().slice(0,-3)}:starRegistry
            const message = `${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`;
            resolve(message);
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                console.log("inside blockchain - submitStar - promise");
                // Get the time from the message sent as a parameter example: parseInt(message.split(':')[1])
                let messageTime = parseInt(message.split(':')[1]);

                // Get the current time
                let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
                
                // Check if the time elapsed is less than 5 minutes
                let timeElapsedLessThan5Minutes =  currentTime < (messageTime + (5*60));

                if (timeElapsedLessThan5Minutes) {
                    // Veify the message with wallet address and signature
                    console.log("about to check message validity");
                    let isMessageValid = bitcoinMessage.verify(message, address, signature);
                    console.log("checked message validity");

                    if (isMessageValid) {
                        const block = new BlockClass.Block({star: star, owner: address });
                        const result = await self._addBlock(block);
                        resolve ({data: result, status: true});
                    } else {
                        resolve({message: "Message signature is not valid", status: false});
                    }

                } else {
                    resolve({message: "Request time out (more than 5 minutes)", status: false});
                }

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        console.log(`hash = ${hash}`);
        return new Promise((resolve, reject) => {
           let blockFound = self.chain.filter(individualBlock => individualBlock.hash === hash)[0];
           if (blockFound) {
               console.log("block found");
               resolve(blockFound);
           } else {
               console.log("block not found");
               resolve(null)
           }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        console.log(`address = ${address}`);
        return new Promise((resolve, reject) => {
            try {
                self.chain.forEach(async (block) => {
                    const star = await block.getBData();
                    // check if data is not null
                    // check if address in the block matches the requested address
                    if (star) {
                        console.log(star.owner); 
                    } else {
                        console.log('star is null');
                    }

                    if (star && star.owner === address){
                        stars.push(star);
                    }
                    console.log(`stars.length=${stars.length}`);
                });
                resolve({data : stars, status: true});
            } catch (error) {
                resolve(null)
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < self.chain.length; i++) {
                const blockIter =  self.chain[i];

                if (!(await blockIter.validate())) {
                    errorLog.push({error: "Failed validation", block: blockIter});
                }

                if (i > 0) {
                    const previousBlockHash = self.chain[i-1].hash;
                    if (blockIter.previousBlockHash != previousBlockHash) {
                        errorLog.push({error: "Failed validation - previous block hash does not match", block: blockIter});
                    }
                }
            }
            resolve(errorLog);
        });
    }

}

module.exports.Blockchain = Blockchain;   