import React, { Component } from 'react';
import ethorsejson from './ETHorse.json';
import AlertMsg from './AlertMsg'
import './App.css';
import ETHRadio from './ETHRadio'
import Amount from './Amount.js'
import {Jumbotron, Container, Button, InputGroup, InputGroupButton, InputGroupAddon, Input} from 'reactstrap'
var Web3 = require('web3');
var contract = require("truffle-contract");

var web3 = new Web3(Web3.givenProvider);

var myContract = contract(ethorsejson);
if(web3.currentProvider!=null)
{
  myContract.setProvider(web3.currentProvider);

}
else{
  // var isChrome = !!window.chrome && !!window.chrome.webstore;
  // console.log(isChrome)
  // if(isChrome){
  // alert("Compatible only with Chrome browser (with Metamask extension), Mist or Geth")
  // }else{
  //   alert("Compatible only with Metamask browser extension for Chrome or Mist browser from Ethereum")
  // }
}

class App extends Component {
  constructor(props)
    {
    super(props);
    this.state={contractState:null,
                network:null,
                nettimer:null,
                contractJSON:ethorsejson,
                price:null,
                invokePrice:null,
                amount:0.1,
                coin:null,
                value: null,
                transactionid:null,
                d:null,
                h:null,
                m:null,
                s:null,
                coinChoice:'',
                coinChosen:false,
                reward:'',
                stopTime:1509007840000,
                startTime:null,
                lockTime:null,
                resultTime:null,
                timeInterval:null,
                claim:false,
                betPhase:'',
                contractInstance:null
                };
    this.invokeContract=this.invokeContract.bind(this);
    this.convertMS=this.convertMS.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.checkRewards=this.checkRewards.bind(this);
    this.claim=this.claim.bind(this);
    this.findTime=this.findTime.bind(this);
    this.resetTimer=this.resetTimer.bind(this);

    //Find betting phase
    this.findStartTime=this.findStartTime.bind(this);
    this.findLockTime=this.findLockTime.bind(this);
    this.findResultTime=this.findResultTime.bind(this);

    }

  findTime()
    {
    var milliseconds = (new Date()).getTime();
    this.convertMS(this.state.stopTime-milliseconds);
    }
  resetTimer()
    {
      var milliseconds = (new Date()).getTime();
      if(parseInt(this.state.stopTime-milliseconds,10)<=0)
        {
        var new_time=this.state.stopTime+86400000;
        clearInterval(this.state.timeInterval)
        clearInterval(this.state.clearTimeInterval)
        this.setState({stopTime:new_time});
        }
    }
  findStartTime()
    {
      var milliseconds = (new Date()).getTime();
      this.convertMS(this.state.startTime-milliseconds);
    }
  findLockTime()
    {
      var milliseconds = (new Date()).getTime();
      this.convertMS(this.state.lockTime-milliseconds);
    }
  findResultTime()
    {
      var milliseconds = (new Date()).getTime();
      this.convertMS(this.state.resultTime-milliseconds);
    }
  checkNetwork(){
      var self=this;
      web3.eth.net.getNetworkType((err, netId) => {
      self.setState({network:netId})
    })

    }

  componentWillMount()
    {

      var ct = null;
      var currentTime = new Date()
      this.checkNetwork()
      currentTime=currentTime.getTime()
      var self=this;
      if(web3.currentProvider!=null)
      {
      myContract.at(ethorsejson.address).then(function(instance){
        self.setState({contractInstance:instance})
        instance.starting_time().then(function(start_time){
          //Check if the bet has started
          start_time=parseInt(start_time,10)
          console.log(currentTime+' , '+start_time*1000)
            if(currentTime<(start_time*1000))
            {
              ct=setInterval(self.findStartTime,950)
              self.setState({timeInterval:ct,betPhase:'Bet Open in ',startTime:start_time*1000})
            }
            else
            {
              //Check if the bet has locked
              instance.betting_duration().then(function(betting_duration){
                betting_duration=parseInt(betting_duration,10)
                console.log(currentTime+' , '+start_time+' ,'+((start_time+betting_duration)*1000)+' '+betting_duration)
                if(currentTime>=(start_time*1000) && currentTime<((start_time+betting_duration)*1000))
                {
                  ct=setInterval(self.findLockTime,950)
                  self.setState({timeInterval:ct,betPhase:'Bet locks and race starts in ',lockTime:((start_time+betting_duration)*1000)})
                }
                else{
                  instance.race_duration().then(function(race_duration){
                    race_duration=parseInt(race_duration,10)
                    console.log(currentTime+' , '+start_time+' ,'+((start_time+betting_duration)*1000)+' ,'+((start_time+race_duration)*1000))
                    //Check if the results are out.
                    if(currentTime<((start_time+race_duration)*1000) && currentTime>=((start_time+betting_duration)*1000))
                      {
                      ct=setInterval(self.findResultTime,950)
                      self.setState({timeInterval:ct,betPhase:'Results in ',resultTime:((start_time+race_duration)*1000)})
                      }
                    else if(start_time>0){

                      self.setState({betPhase:'Check result to see your winnings.'})
                    }
                    else{
                      self.setState({betPhase:"Currently no race in progress."})
                    }

                  })
                }
              })
            }
        })
      })
      myContract.at(ethorsejson.address).then(function(instance){
        instance.race_end().then(function(state){
            self.setState({claim:state})
        })
      })



    }
    }
  componentDidMount(){
    myContract.at(ethorsejson.address).then(function(instance){
      var ethAccount='';
      web3.eth.getAccounts(function(err, accounts){
        ethAccount=accounts[0]
        }).then(function()
                {
                if(ethAccount!==undefined){
                web3.eth.getBalance(ethAccount).then(function(balance){

                    if(web3.utils.fromWei(balance)==="0"){
                      let faucet= document.getElementById('faucet')
                      faucet.classList.remove("hidden");
                    }
                    return web3.utils.fromWei(balance);
                });
              }})});
  }


  convertMS(ms)
    {
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    d=d+' days,'
    h=h+' hours,'
    m=m+' minutes,'
    s=s+' seconds.'
    this.setState({ d: d, h: h, m: m, s: s });
    }


  invokeContract()
    {
    if(this.state.amount<0.1 || this.state.amount>1)
    {
      alert('Bet minimum 0.1 ETH and a maximum of 1 ETH');
      return;
    }
    var self=this;
    this.setState({value:null},function(){
      myContract.at(ethorsejson.address).then(function(instance){
        var ethAccount='';
        web3.eth.getAccounts(function(err, accounts){
          ethAccount=accounts[0]
          }).then(function()
                  {
                  console.log(web3.fromWei(web3.eth.getBalance(ethAccount)));


                    instance.race_end().then(function(state){
                        if(state===false)
                        {
                          const txo = {
                            from: ethAccount,
                            value: web3.utils.toWei(self.state.amount),
                            data:self.state.coin
                          };
                          if(txo.data!==null && ethAccount!==undefined)
                            {
                            self.setState({transactionid:'Placing Bet...'},function(){
                            instance.placeBet(self.state.coin,txo).then(function(res,error){

                              self.setState({transactionid:('Transaction ID: '+res.tx),value:self.state.coin});
                            }).catch(function(e){
                              if(e.message==="MetaMask Tx Signature: User denied transaction signature.")
                              {
                                self.setState({value:null,transactionid:null})

                              }
                            })})
                            }
                          else if(ethAccount===undefined){
                              alert('Your Metamask seems to be locked. Please unlock to place a bet.')
                            }
                          else
                            {
                              self.setState({coinChosen:true});
                            }
                        }
                    })

                  /*instance.Deposit({}, {fromBlock: 0, toBlock: 'latest'}).get(function(error,result){
                  //console.log(result)
                });*/

              });
          })
    })


    }


  onValueSubmit(amount)
    {
    this.setState({amount:amount});
    }


  coinValue(coin)
    {
      var self=this;

        self.state.contractInstance.race_end().then(function(state){
          if(state===false)
          {
          self.setState({coin:coin,value:coin});
          }
        });
    }

  onDismiss(err) {
      if(err==="Error")
        {
        this.setState({ visible: true });
        }
      else {
        this.setState({ visible: false });
      }
    }

  checkRewards()
    {
    var self=this;
    myContract.at(ethorsejson.address).then(function(instance)
          {
            var ethAccount;
            web3.eth.getAccounts(function(err, accounts){
              ethAccount=accounts[0]
            }).then(function(){
                const txo = {
                  from: ethAccount
                };
            instance.check_reward.call(txo).then(function(reward)
              {
              reward='You have won '+web3.utils.fromWei(reward,"ether")+' ETH';

              self.setState({reward});
              });
              });
        });
    }
  claim()
    {

    myContract.at(ethorsejson.address).then(function(instance)
          {

            var ethAccount;
            web3.eth.getAccounts(function(err, accounts){
              ethAccount=accounts[0]
            }).then(function(){
              const txo = {
                from: ethAccount
              };
                instance.claim_reward.estimateGas(txo).then(function(gas)
              {
                txo.gas=gas;
                instance.claim_reward(txo).then(function(res,error)
                  {

                  });
              })

              });

          });
    }
  render()
    {
    if(web3.currentProvider!=null  && this.state.network==="ropsten")
    {
    return (
            <div>
            {/* <Jumbotron style={{ 'textAlign': 'center'}} fluid> */}
            <Container>
              <div className="row">
                <div className="col-md-10 mx-auto">
                <h2 className="hidden" id="faucet">
                  Get ropsten ethers at <a href="https://faucet.metamask.io/">faucet.metamask.io</a>
                </h2>
                </div>
              </div>
              <div className="row">
              <div className="col-md-12 mx-auto">
              <ETHRadio onSubmit={this.coinValue.bind(this)} name="Radio"/>
              <InputGroup>
                <InputGroupAddon>&Xi;</InputGroupAddon>
                <Amount field="Amount" onValueSubmit={this.onValueSubmit.bind(this)}/>
                <InputGroupButton>
                <Button type="button" onClick={this.invokeContract.bind(this)} color="primary" disabled={!this.state.value} size="lg">Place bet</Button>
                </InputGroupButton>
              </InputGroup>
              <br/>
              <InputGroup >
              <InputGroupButton>
              <Button type="button"  color="info" size="lg" onClick={this.checkRewards} disabled={!this.state.claim}>Check result</Button>
              </InputGroupButton>
              <Input disabled={true} value={this.state.reward}/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="button" size="lg" onClick={this.claim} id="claim" disabled={!this.state.claim}>Claim</Button>
              </InputGroup>
              <AlertMsg visible={this.state.coinChosen} onSubmit={this.onDismiss} msg='Please choose a coin'/>
              <br/>
              <br/>
              {this.state.transactionid}
              <br/>
              <br/>
              {this.state.betPhase} {this.state.d}  {this.state.h} {this.state.m}  {this.state.s}
              <br/>
              <br/>
              Race duration: 7 days
              <br/>
              <br/>
              Currently on Ropsten Testnet. Mainnet release coming soon. Be ready to bet with real money!
              <br/>
              Join <a href="https://discord.gg/vdTXRmT" rel="noopener noreferrer" target="_blank"> Discord </a> to stay tuned.
              <br/>
              <a href="https://www.reddit.com/r/ethdev/comments/7asfml/bounty_open_for_ethorse_dapp_smart_contract/"  rel="noopener noreferrer" target="_blank">Public bug bounty</a>
            </div>


            </div>
            </Container>
            {/* </Jumbotron> */}
            </div>
            );
          }
          return(<Jumbotron style={{ 'textAlign': 'center'}} fluid>
          <Container>
              <h3>You are on {this.state.network} network.<br/>
          Please use metamask to switch to Ropsten Testnet.</h3>
          <br/>
          <img src="https://github.com/MetaMask/faq/raw/master/images/click-the-test-network.png" alt="switch to ropsten"/>
        </Container>
        </Jumbotron>)
    }
}

export default App;
