import React, { Component } from 'react';
// import ethorsejson from './ETHorse.json';
import ethorsejson from './ETHorse.json';
// import AlertMsg from './AlertMsg'
import './App.css';
import ETHRadio from './ETHRadio'
import Amount from './Amount.js'
import Header from './Header'
import Contract from './Contract'
import Result from './Result'
import $ from 'jquery'
import jQuery from 'jquery'
// import 'jQuery'
import FlipClock from './FlipClock-master/compiled/flipclock.js'
import {Jumbotron, Container, Button, InputGroup, InputGroupButton, InputGroupAddon, Input, UncontrolledTooltip} from 'reactstrap'

var Web3 = require('web3');
var contract = require("truffle-contract");
// var FlipClock=require("flipclock")
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
                transactionidmsg:null,
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
                contractInstance:null,
                flashmessage:null,
                contract:null,
                duration:"",
                bettingStatus:false
                };
    this.invokeContract=this.invokeContract.bind(this);
    this.convertMS=this.convertMS.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.checkRewards=this.checkRewards.bind(this);
    this.claim=this.claim.bind(this);
    this.findTime=this.findTime.bind(this);
    this.resetTimer=this.resetTimer.bind(this);
    this.componentLoad=this.componentLoad.bind(this);
    this.componentMounted=this.componentMounted.bind(this);
    this.startFlipClock=this.startFlipClock.bind(this);

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
  startFlipClock(time)
  {
    $(document).ready(function () {
      console.log('ready')
    var clock = $('.flipclock').FlipClock(time, {
    clockFace: 'DailyCounter',
    countdown: true,
    autoStart: true,
    callbacks: {
      start: function() {
        console.log('started')
        $('.message').html('The clock has started!');
      }
    }
  });
  // $('.flipclock').addClass('twoDayDigits');
  //   clock.start();
    });
  }
  componentLoad()
  {
    var ct = null;
    var currentTime = new Date()
    this.checkNetwork()
    currentTime=currentTime.getTime()
    var self=this;

    if(this.state.timeInterval!=null)
    {
      console.log(this.state.timeInterval)
      for (var i = 1; i <= this.state.timeInterval; i++)
        clearInterval(i);

      this.setState({"h":null,"d":null,"m":null,"s":null})
      // console.log(this.state.contract)
    }
    if(web3.currentProvider!=null)
    {

    myContract.at(this.state.contract).then(function(instance){
      self.setState({contractInstance:instance})
      instance.starting_time().then(function(start_time){
        //Check if the bet has started
        start_time=parseInt(start_time,10)
        // console.log(currentTime+' , '+start_time*1000)
          if(currentTime<(start_time*1000))
          {
            ct=setInterval(self.findStartTime,950)
            self.setState({timeInterval:ct,betPhase:'Bet Open in ',startTime:start_time*1000})

            self.startFlipClock(start_time-new Date()/1000)

          }
          else
          {
            //Check if the bet has locked
            instance.betting_duration().then(function(betting_duration){
              betting_duration=parseInt(betting_duration,10)
              // console.log(currentTime+' , '+start_time+' ,'+((start_time+betting_duration)*1000)+' '+betting_duration)
              if(currentTime>=(start_time*1000) && currentTime<((start_time+betting_duration)*1000))
              {
                ct=setInterval(self.findLockTime,950)

                self.setState({timeInterval:ct,betPhase:'Betting closes and Race starts in ',lockTime:((start_time+betting_duration)*1000)})
                self.startFlipClock(start_time+betting_duration-new Date()/1000)

              }
              else{
                instance.race_duration().then(function(race_duration){
                  race_duration=parseInt(race_duration,10)
                  // console.log(currentTime+' , '+start_time+' ,'+((start_time+betting_duration)*1000)+' ,'+((start_time+race_duration)*1000))
                  //Check if the results are out.
                  if(currentTime<((start_time+race_duration)*1000) && currentTime>=((start_time+betting_duration)*1000))
                    {
                    ct=setInterval(self.findResultTime,950)
                    let race_duration_utc=new Date(race_duration)
                    console.log(race_duration_utc)
                    self.setState({timeInterval:ct,betPhase:'Results in ',resultTime:((start_time+race_duration)*1000),duration:race_duration_utc.toString()})

                    let time=parseInt(start_time)+parseInt(race_duration)-new Date()/1000
                    console.log(time-new Date()/1000)
                    self.startFlipClock(time)

                    }
                  else if(start_time>0){

                    self.setState({betPhase:'Check result to see your winnings.',duration:'Race completed'})
                  }
                  else{
                    self.setState({betPhase:"Currently no race in progress.",duration:'Race not active yet'})
                  }

                })
              }
            })
          }
          instance.race_duration().then(function(race_duration){

            instance.betting_duration().then(function(betting_duration){
              race_duration=parseInt(race_duration,10)
              betting_duration=parseInt(betting_duration,10)
                let race_duration_utc=new Date(race_duration-betting_duration)
                let ms=(race_duration-betting_duration)*1000
                let  h, m, s;
                s = Math.floor(ms / 1000);
                m = Math.floor(s / 60);
                s = s % 60;
                h = Math.floor(m / 60);
                m = m % 60;
                // d = Math.floor(h / 24);
                // h = h % 24;

                h=h+' hours'
                // m=m+' minutes,'
                // s=s+' seconds.'
                race_duration_utc=h;
                console.log(race_duration/60)
                self.setState({duration:race_duration_utc.toString()})

            });


          })
      })
    })
    myContract.at(this.state.contract).then(function(instance){
      instance.race_end().then(function(state){
          self.setState({claim:state})
      })
    })



  }
  }
  componentMounted()
  {
    if(this.state.contract!==null)
    myContract.at(this.state.contract).then(function(instance){
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
      this.checkRewards()
  }
  componentWillMount()
    {
    // if(this.state.contract!==null)
    // {
    // this.componentLoad();
    //
    // }
    }
  componentDidMount(){
    if(this.state.contract!==null)
    this.componentMounted();
              // $('.amount').tooltip({show: {effect:"none", delay:0}});

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
      myContract.at(this.state.contract).then(function(instance){
        var ethAccount='';
        web3.eth.getAccounts(function(err, accounts){
          ethAccount=accounts[0]
          }).then(function()
                  {
                  // console.log(web3.fromWei(web3.eth.getBalance(ethAccount)));


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

                              self.setState({transactionid:('Transaction ID: '+res.tx+'. '),transactionidmsg:"Good luck. You can use \"Check result\" and \"Claim\" after the race is over.",value:self.state.coin});
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
    myContract.at(this.state.contract).then(function(instance)
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
                instance.race_end.call().then(function(isRaceEnd){

                    if( isRaceEnd){
                      console.log('race end ',isRaceEnd);
                        reward='You have won '+web3.utils.fromWei(reward,"ether")+' ETH';
                        self.setState({reward});
                    } else if(!isRaceEnd){
                      reward = 'Available after race ends'
                      self.setState({reward});
                    } else {
                      reward = ''
                      self.setState({reward});
                    }
                });

              // reward='You have won '+web3.utils.fromWei(reward,"ether")+' ETH';

              self.setState({reward});
              });
              });
        });
    }
  contractUpdate(contract)
  {
    let self=this;

    this.setState({contract},function(){

      self.componentLoad();
      self.componentMounted();
    })

    myContract.at(contract).then(function(instance){
      instance.betting_open.call().then(function (status) {
        self.setState({bettingStatus: status})
      });
    });
  }
  claim()
    {
    console.log('claim')
    myContract.at(this.state.contract).then(function(instance)
          {

            var ethAccount;
            web3.eth.getAccounts(function(err, accounts){
              ethAccount=accounts[0]
            }).then(function(){
              console.log(ethAccount)
              if(ethAccount===undefined){
                  alert('Your Metamask seems to be locked. Please unlock to place a bet.')
              } else {
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
              }

            });

          });
    }
  render()
    {
    if(web3.currentProvider!=null  && this.state.network==="ropsten" && this.state.contract!==null)
    {

    return (
            <div>
            <Header contract={this.state.contract}/>
            <div>
            {/* <Jumbotron style={{ 'textAlign': 'center'}} fluid> */}
            <Container>

              <div className="row">
                <div className="col-md-10 mx-auto">
                <h5 className="hidden" id="faucet">
                  Get some ropsten ethers to try the dapp. <a href="https://faucet.metamask.io/" style={{  'color':'orange' }}>Metamask Faucet</a>
                </h5>
                </div>
              </div>
              <div className="row" >
                {/* <div className="col-md-2 mx-auto">
                  <div className="row">
                  <Container>
                    <Result contract={this.state.contract}/>
                  </Container>
                  </div>
                </div> */}
                {/* <div className="col-md-10 mx-auto"> */}
                  <Container>
                    <Result contract={this.state.contract}/>
                    <Contract className="contract" onContractSubmit={this.contractUpdate.bind(this)}/>
                  </Container>
                {/* </div> */}
              </div>
              <div className="row">
              <div className="col-md-12 mx-auto">
              {this.state.flashmessage}
              <ETHRadio onSubmit={this.coinValue.bind(this)} name="Radio" currentContract={this.state.contract}/>
              <InputGroup>
                <InputGroupAddon>&Xi;</InputGroupAddon>
                <Amount field="Amount" onValueSubmit={this.onValueSubmit.bind(this)} className="amount"/>

                <InputGroupButton>
                {/* <a href="#" id="PlaceBetTooltip"><Button type="button" onClick={this.invokeContract.bind(this)} color="primary" disabled={!this.state.value} size="lg">Place bet</Button></a> */}
                <a  id="PlaceBetTooltip"><Button type="button" onClick={this.invokeContract.bind(this)} disabled={!this.state.bettingStatus} color="primary" size="lg">Place bet</Button></a>
                <UncontrolledTooltip placement="right" target="PlaceBetTooltip">
                  Place your bet after choosing your coin. The coin can be chosen by clicking on one of the 3 options under the Select a Coin column.
                </UncontrolledTooltip>
                </InputGroupButton>
              </InputGroup>
              <br/>
              <InputGroup >
              <InputGroupButton>
              <a id="CheckResultTooltip"><Button type="button"  color="info" size="lg" className="tool-tip" onClick={this.checkRewards} disabled={!this.state.claim}><span className="reload">&#x21bb;</span>&nbsp;Result</Button></a>
              <UncontrolledTooltip placement="left" target="CheckResultTooltip">
                Click to check the bet result after the results are announced for this race. Enabled only after the race is completed.
              </UncontrolledTooltip>
              </InputGroupButton>
              <Input disabled={true} value={this.state.reward}/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <a id="ClaimTooltip"><Button type="button" size="lg" onClick={this.claim} id="claim" className="tool-tip" disabled={!this.state.claim}>Claim</Button></a>
              <UncontrolledTooltip placement="right" target="ClaimTooltip">
                Click to claim reward if you win. This opens a Metamask window to send an empty traction. Submitting that will get your winnings deposited to your wallet.
              </UncontrolledTooltip>
              </InputGroup>

              <br/>
              <br/>
              <div>{this.state.transactionid}
                <br/>
              {this.state.transactionidmsg}</div>
              <br/>
              <br/>
              {this.state.betPhase} {this.state.d}  {this.state.h} {this.state.m}  {this.state.s}
              <br/>
              <br/>
              Race duration: {this.state.duration}
              {/* <div className="flipclock" style={{"paddingTop":"3%",'left':'35%'}}/> */}
              <div className="flipclock" style={{'left':'35%'}}/>
              <br/>
              <br/>
              Currently on Ropsten Testnet. Mainnet release coming soon. Be ready to bet with real money!
              <br/>
              {/* Join <a href="https://discord.gg/vdTXRmT" rel="noopener noreferrer" target="_blank"> Discord </a> to stay tuned. */}
              <br/>
              <p>Join our community to stay tuned. <br/>
                <a style={{'marginRight':'3%'}} target="_blank" rel="noopener noreferrer" href="https://telegram.me/ethorse" ><img alt="telegram" src="https://png.icons8.com/windows/50/ffffff/telegram-app.png"/></a>
                <a style={{'marginRight':'3%'}} target="_blank" rel="noopener noreferrer" href="https://discord.gg/vdTXRmT" ><img alt="discord" src="https://png.icons8.com/ios/50/ffffff/discord-logo.png"/></a>
                <a href="https://github.com/ethorse" target="_blank" rel="noopener noreferrer" ><img alt="github" src="https://png.icons8.com/windows/50/ffffff/github.png"/></a>
              </p>
            </div>


            </div>
            </Container>
            {/* </Jumbotron> */}
            {/* <div>
              <UncontrolledTooltip placement="right" target="PlaceBetTooltip">
                Hello world!
              </UncontrolledTooltip>

            </div> */}

            </div>
            </div>
            );
          }
          else if(this.state.contract===null)
          {
            return(<div>
                    <Header contractUpdate={this.contractUpdate.bind(this)}/>
                    <Contract onContractSubmit={this.contractUpdate.bind(this)}/>
                  </div>
                  )
          }
          else if(this.state.network!=="ropsten")
          {
          return(<Jumbotron style={{ 'textAlign': 'center'}} fluid>
          <Container>
              <h3>Your Metamask is on {this.state.network} network.<br/>
          Please switch to Ropsten Testnet as shown below.</h3>
          <br/>
          <img src="https://github.com/MetaMask/faq/raw/master/images/click-the-test-network.png" target="_blank" alt="switch to ropsten"/>
        </Container>
        </Jumbotron>)
      }
      else{
        return (<div/>);
      }
    }
}

export default App;
