App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.loadWeb3();
  },

 loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
      return App.initContract();
    },

  initContract: function() {
    $.getJSON("eVoting.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.eVoting = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.eVoting.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.eVoting.deployed().then(function(instance) {
      
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });


    // Load contract data
     App.contracts.eVoting.deployed().then(function(instance){
    return instance.electionStatus()
  }).then(function(i){
    if(i==0){
      console.log("election not started");
      $('#announcement').html("Election not yet started.")
    }
    else if(i==1||i==2){
      console.log("election started");
      $('#announcement').html("Vote For Change👆");
      App.contracts.eVoting.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.noOfCandidates();
      }).then(function(candidatesCount) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();
  
        var candidatesSelect = $('#candidatesSelect');
        candidatesSelect.empty();
  
        for (var j = 0; j <= candidatesCount; j++) {
          electionInstance.candidates(j).then(function(candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
  
            // Render candidate Result
            var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            candidatesResults.append(candidateTemplate);
  
            // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          });
        }
        electionInstance.voters(App.account).then(function(voted){
          return voted[0];
        }).then(function(hasVoted) {
          // Do not allow a user to vote
          if(hasVoted) {
            $('form').hide();
          }
          loader.hide();
          content.show();
        }).catch(function(error) {
          console.warn(error);
        });
      })
      if(i==2){
        console.log("election ended");
        $('#announcement').html("Election has ended");
        $('#voteform').hide();
      }
    }
  })
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.eVoting.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  // endElection: function(){
  //   console.log("ending  election");
  //   App.contracts.eVoting.deployed().then(function(instance){
  //     return instance.owner();
  //   }).then(function(result){
  //     if(App.account==result){
  //       App.contracts.eVoting.deployed().then(function(instance){
  //         instance.end();
  //         window.location.href = "homepage.html"
  //       })
  //     }
  //   })
    
    
  // },

  startElect:function(){
    console.log("inside start election function");
    App.contracts.eVoting.deployed().then(function(instance){
      instance.startElection({ from: App.account });
    })
  },  
  endElection: function(){
    console.log("ending  election");
    App.contracts.eVoting.deployed().then(function(instance){
      return instance.owner();
    }).then(function(result){
      if(App.account==result){
        App.contracts.eVoting.deployed().then(function(instance){
        console.log("same");
        $("#voteform").hide();
        instance.end(App.account, { from: App.account });
        console.log("Successfully ended the election");
        })
      }
      else
        alert("Yoy are not admin!!");
    })
  },

  adminCheck:function(){
    console.log("inside admin");
    App.contracts.eVoting.deployed().then(function(instance){
      return instance.owner();
    }).then(function(result){
      if(App.account==result)
         window.location.href = "admin.html";
      else
         window.location.href = "adminlogin.html";
    })
  },

  addCandid:function(){
    console.log("inside add candid function");
    var name =document.getElementById("candidatename").value;
    App.contracts.eVoting.deployed().then(function(instance){
      instance.addCandidate(name,{ from: App.account } )
    })
  },

  // getAccounts: function(callback) {
  //   web3.eth.getAccounts((error,result) => {
  //       if (error) {
  //           console.log(error);
  //       } else {
  //           callback(result);
  //       }
  //   });
  // },

  verifyVoter: async function(){
    const current_account = App.account;
    const data = {current_account};

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    };

    const res = await fetch("/verify", options);
    const res_json = await res.json();
    if(res_json.status === 'success'){
      window.location.href = "homepage.html";
    }
    else if (res_json.status === 'fail'){
      window.location.href = "adminlogin.html";
    }
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
