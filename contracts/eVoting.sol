pragma solidity >=0.4.22 <0.9.0;

contract eVoting{
    uint public totalVoteCount = 0;
    uint public candidateCount = 0;

    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }

    constructor() public{
        createCandidate("Roshan Bhatt");
    }

    mapping(uint => Candidate) public Candidates;

    function createCandidate(string memory _name) public{
        candidateCount ++;
        Candidates[candidateCount] = Candidate(candidateCount,_name,0);
    }
}