import Web3 from "web3";
import kamalTokenSaleArtifact from "../../build/contracts/KamalTokenSale.json";
import kamalTokenArtifact from "../../build/contracts/KamalToken.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/app.css';

const App = {
  web3: null,
  account: '0x0',
  kmlSaleMeta: null,
  kmlTokenMeta: null,
  loading: false,
  tokenPrice: 0,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: async function() {
    if (window.ethereum) {
      // use kmlSaleMetaMask's provider
      App.web3 = new Web3(window.ethereum);
      await window.ethereum.enable(); // get permission to access accounts
    } else {
      console.warn(
        "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      App.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
      );
    }
  },

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const kmlSaleDeployedNetwork = kamalTokenSaleArtifact.networks[networkId];
      this.kmlSaleMeta = new web3.eth.Contract(
        kamalTokenSaleArtifact.abi,
        kmlSaleDeployedNetwork.address,
      );
      console.log(`kmlSaleMeta = ${this.kmlSaleMeta.methods}`);

      console.log(`Kamal Token Sale Address = ${kmlSaleDeployedNetwork.address}`);

      const kmlTokenDeployedNetwork = kamalTokenArtifact.networks[networkId];
      this.kmlTokenMeta = new web3.eth.Contract(
        kamalTokenArtifact.abi,
        kmlTokenDeployedNetwork.address,
      );

      console.log(`Kamal Token Address = ${kmlTokenDeployedNetwork.address}`);
      App.render();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  render: async function() {
    // hide the content
      if(App.loading) {
        return;
      }

      App.loading = true;

      var loaderElement = document.getElementById('loader');
      var contentElement = document.getElementById('content');
      loaderElement.style.display = 'block';
      contentElement.style.display = 'none';

      // get the account info
      const { web3 } = this;
      let account = await web3.eth.getAccounts();
      App.account = account;
      console.log(`App.account = ${App.account}`);

      const accountAddressElement = document.getElementById('accountAddress');
      accountAddressElement.innerHTML = App.account;

      // get token price
      const { tokenPrice } = this.kmlSaleMeta.methods;
      this.tokenPrice = await tokenPrice().call();
      var tokenPriceElement = document.getElementsByClassName('token-price');
      tokenPriceElement[0].innerHTML = web3.utils.fromWei(this.tokenPrice, "ether");

      // get tokens sold
      const { tokensSold } = this.kmlSaleMeta.methods;
      this.tokensSold = await tokensSold().call();
      var tokensSoldElement = document.getElementsByClassName('tokens-sold');
      tokensSoldElement[0].innerHTML = this.tokensSold;

      // set tokens available
      var tokensAvailableElement = document.getElementsByClassName('tokens-available');
      tokensAvailableElement[0].innerHTML = this.tokensAvailable;
      
      // setup the progress bar
      var progressPercentage = Math.ceil(this.tokensSold * 100 / this.tokensAvailable);
      var progressElement = document.getElementById('progress');
      progressElement.style.width = `${progressPercentage}%`;

      // set account's available token balance
      const { balanceOf } = this.kmlTokenMeta.methods;
      var accountsBalance = await balanceOf(this.account[0]).call();
      var balanceElement = document.getElementsByClassName('kamal-balance')[0];
      balanceElement.innerHTML = accountsBalance;
      

      // show the content
      App.loading = false;
      loaderElement.style.display = 'none';
      contentElement.style.display = 'block';
  },

  buyTokens: async function() {
    var contentElement = document.getElementById('content');
    contentElement.style.display = 'none';
    var loaderElement = document.getElementById('loader');
    loaderElement.style.display = 'block';

    var numberOfTokens = document.getElementById('numberOfTokens').value;
    const { buyTokens } = this.kmlSaleMeta.methods;
    console.log('App.account = ', App.account);
    await buyTokens(numberOfTokens).send({
      from: App.account[0],
      value: numberOfTokens * App.tokenPrice,
      gas: 500000
    }).then(function(receipt) {
      console.log('got buyTokens receipt');
      document.getElementById("buyTokensForm").reset();
      App.render();
    });
  },

};

window.App = App;

window.addEventListener("load", function() {

  App.init();
  App.start();
});

window.ethereum.on('accountsChanged', function (accounts) {
  // Time to reload your interface with accounts[0]!
  console.log('accounts changed event');
  App.init();
  App.start();
});
