var Web3 = require('web3');

var url = 'HTTP://127.0.0.1:7545';

var web3 = new Web3(url);

web3.eth.getChainId().then(console.log);