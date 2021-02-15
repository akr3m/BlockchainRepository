/* Configuration
*/

// Step1: setup the appropriate configuration

var Web3 = require('web3');
var EthereumTransaction = require('ethereumjs-tx').Transaction;
var web3 = new Web3('HTTP://127.0.0.1:7545');

// Step2: set the sending and receiving address for the transaction
var sendingAddress = '0x906062D0011F3c8a67516CA0be18f7F9FCF91D43';
var receivingAddress = '0x9CaFb68f86dd7792039cc9E265711b51a278d32f';

// Step3: check the balances of each address
web3.eth.getBalance(sendingAddress).then(console.log);
web3.eth.getBalance(receivingAddress).then(console.log);


//web3.eth.getGasPrice((err, res) => {console.log(`gas price: ${res}`)});


//web3.eth.getUncle('0x4177ef08bd80b1e8be158abfa95aff1fbd03c0c415b00aff58c7e6c6f3175491', 0, false, (err, res) => {console.log(`uncle.hash: ${JSON.stringify(res)}`)});

//web3.eth.getBlockTransactionCount('0x4177ef08bd80b1e8be158abfa95aff1fbd03c0c415b00aff58c7e6c6f3175491', (err, res) => {console.log(`txn count: ${res}`)});
/***********
 * Create a transaction
 */

// step4: set up the transaction using the transaction variable
var rawTransaction = {
    nonce: 4,
    to: receivingAddress,
    gasPrice: 20000000,
    gasLimit: 30000,
    value: 1000,
    data: '0x'
};

// step5: view the raw transaction
console.log(`rawTransaction = ${JSON.stringify(rawTransaction)}`);

// step6: check the new account balances; shouldn't change since we didn't send anything yet
web3.eth.getBalance(sendingAddress).then(console.log);
web3.eth.getBalance(receivingAddress).then(console.log);

// step7: sign the transaction
var privateKeySender = '4177ef08bd80b1e8be158abfa95aff1fbd03c0c415b00aff58c7e6c6f3175491';
var privateKeySenderHex = new Buffer(privateKeySender, 'hex');
var transaction = new EthereumTransaction(rawTransaction);
transaction.sign(privateKeySenderHex);

// step8: send the transaction
var serializedTransaction = transaction.serialize();


web3.eth.sendSignedTransaction(serializedTransaction).then(console.log('success')).catch(error => {console.log(error)});
