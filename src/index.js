import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import './FlipClock-master/compiled/flipclock.css'
import registerServiceWorker from './registerServiceWorker';
// import Header from './Header'
import Warning from './Warning'

var Web3 = require('web3');
// var contract = require("truffle-contract");

var web3 = new Web3(Web3.givenProvider);


if(web3.currentProvider!=null){
ReactDOM.render(<App />, document.getElementById('root'));
}
else{
  ReactDOM.render(<Warning/>, document.getElementById('root'));
}
registerServiceWorker();
