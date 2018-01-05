import React, { Component } from 'react';

import ethorsejson from './ETHorse.json';



var Web3 = require('web3');
var contract = require("truffle-contract");

var web3 = new Web3(Web3.givenProvider);

var myContract = contract(ethorsejson);

if(web3.currentProvider!=null)
{
  myContract.setProvider(web3.currentProvider);
}

export default class Result extends Component{
  constructor(props){
    super(props);
    this.state={contract:this.props.contract,winner:"",start_time:""}
  this.checkWinner=this.checkWinner.bind(this);

  }
  checkWinner()
  {
     let self=this;
    myContract.at(this.props.contract).then(function(instance)
          {
            instance.race_end().then(function(state){
              if(state===false)
              {
              self.setState({winner:""})
              }
              else{
                instance.winner_horse().then(function(winner){
                    self.setState({winner:web3.utils.toAscii(winner)})
                });
                instance.starting_time().then(function(start_time){
                  start_time=parseInt(start_time,10)
                  console.log(start_time)
                  let start_time_utc=new Date(start_time*1000);

                  Date.prototype.getMonthName = function() {
    var monthNames = [ "January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December" ];
    return monthNames[this.getMonth()];
};                 console.log(start_time_utc.getDate())
                  self.setState({start_time:start_time_utc.getDate()+" "+start_time_utc.getMonthName()});
                })
              }
            });
          });
  }
  componentWillMount()
  {
    this.checkWinner();
  }
  componentDidUpdate()
  {
    if(this.props.contract!==this.state.contract)
    {
      let self=this;
    myContract.at(this.props.contract).then(function(instance)
          {
            instance.race_end().then(function(state){
              if(state===false)
              {
              self.setState({winner:""})
              }
              else{
                instance.winner_horse().then(function(winner){
                    self.setState({winner:web3.utils.toAscii(winner)})
                  instance.starting_time().then(function(start_time){
                    start_time=parseInt(start_time,10)
                    console.log(start_time)
                    let start_time_utc=new Date(start_time*1000);
                    Date.prototype.getMonthName = function() {
      var monthNames = [ "January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December" ];
      return monthNames[this.getMonth()];
  };                 console.log(start_time_utc.getDate())
                    self.setState({start_time:start_time_utc.getDate()+" "+start_time_utc.getMonthName()});
                  })

                });
              }
            });

          });
    this.setState({contract:this.props.contract})
    }
  }
  render()
  {
    if(this.state.winner==="")
    return(
      <span style={{position:'relative',fontSize:'30px'}} className="float-left">
          Live&nbsp;
        <sup ><i className="fa fa-circle" aria-hidden="true" style={{"color":"green","fontSize":"15px"}}></i></sup>
      </span>
    );
    else {
      return(<span style={{fontSize:'25px','position':'relative'}} className="float-left">
              <span style={{"font-size":"25px" }}>
                {/* The winner for race on {this.state.start_time} is {this.state.winner} */}
                The winner is {this.state.winner}
                {/* <p><img src="https://png.icons8.com/ios-glyphs/40/ffffff/trophy.png"/>
                {this.state.winner}&nbsp;&nbsp;&nbsp;&nbsp;
                <img src="https://png.icons8.com/windows/40/ffffff/planner.png"/>
                {this.state.start_time}</p> */}
              </span>
            </span>);
    }
  }
}
