pragma solidity >=0.4.22 <0.9.0;
 

contract eVoting{
 struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }
    
    struct Voter{
        //bool authorized;
        bool voted;
        uint vote;
    }
    
    address payable public owner;
    string public electionName;
    uint public noOfCandidates;
    bool public electionStatus=true;
    
    mapping(address=>Voter) public voters;
    Candidate[] public candidates;
    
    uint public totalVotes;
    
    constructor(string memory _name) public{
        owner=msg.sender;
        electionName=_name;
        addCandidate("rithick");
        addCandidate("roshan");
        addCandidate("roshan bhatt");
    }

     event votedEvent (
        uint indexed _voteIndex
    );
    
    modifier ownerOnly(){
        require(owner==msg.sender);
        _;
    }
    
    function addCandidate(string memory _name)ownerOnly public{
        noOfCandidates++;
        candidates.push(Candidate(noOfCandidates,_name,0));
    }
    
    // function getNumCandidate() public view returns(uint){
    //     return candidates.length;
    // }
    
    // function authorize(address _person) ownerOnly public{
    //     voters[_person].authorized=true;
    // }
    
    function vote(uint _voteIndex) public{
        require(!voters[msg.sender].voted);
        if(electionStatus){
        //require(voters[msg.sender].authorized);
        
        voters[msg.sender].vote=_voteIndex;
        voters[msg.sender].voted=true;
        
        candidates[_voteIndex-1].voteCount+=1;
        totalVotes+=1;
        
        emit votedEvent(_voteIndex);
        }
        
    }
    
    function end() public ownerOnly{
        electionStatus=false;
        selfdestruct(owner);
    }
}