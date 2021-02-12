/* Configuration
*/

// Step1: setup the appropriate configuration

var Web3 = require('web3');
var EthereumTransaction = require('ethereumjs-tx').Transaction;
var web3 = new Web3('HTTP://127.0.0.1:7545');

// Step2: set the sending and receiving address for the transaction
var sendingAddress = '0xF7FDfE99519f827be8633e0a77d59bE3510ac2FC';
var receivingAddress = '0x6358090D945c68b5551Bf7012861b9a49e5726c4';

// Step3: check the balances of each address
web3.eth.getBalance(sendingAddress).then(console.log);
web3.eth.getBalance(receivingAddress).then(console.log);


web3.eth.getGasPrice((err, res) => {console.log(`gas price: ${res}`)});


web3.eth.getUncle('0x580bf0d166d1d1305dbb0b559d76c744ee95c0c2e37855a42920c0e57ac2c5a7', 0, false, (err, res) => {console.log(`uncle.hash: ${JSON.stringify(res)}`)});

web3.eth.getBlockTransactionCount('0x580bf0d166d1d1305dbb0b559d76c744ee95c0c2e37855a42920c0e57ac2c5a7', (err, res) => {console.log(`txn count: ${res}`)});
/***********
 * Create a transaction
 */

// step4: set up the transaction using the transaction variable
var rawTransaction = {
    nonce: 0,
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
/*var privateKeySender = '6558550ce77ebb4054dcf3b5c7976d7e3046439a18f69b4a3eacd93077dad188';
var privateKeySenderHex = new Buffer(privateKeySender, 'hex');
var transaction = new EthereumTransaction(rawTransaction);
transaction.sign(privateKeySenderHex);

// step8: send the transaction
var serializedTransaction = transaction.serialize();


web3.eth.sendSignedTransaction(serializedTransaction).then(console.log('success')).catch(error => {console.log(error)});
*/