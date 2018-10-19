const Web3 = require('web3')
const config = require('config')
const fs = require('fs')
const blockInfo = require('./files/startEndBlock')

if (!('startBlock' in blockInfo ) && !('endBlock' in blockInfo)) {
    console.log('DO NOT know start & end block to check')
    process.exit(1)
}
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.get('WEB3_WS_URI')))

let ABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidates",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "candidateCount",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "voterWithdrawDelay",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "maxValidatorNumber",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "candidateWithdrawDelay",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "minCandidateCap",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_candidates",
                "type": "address[]"
            },
            {
                "name": "_caps",
                "type": "uint256[]"
            },
            {
                "name": "_firstOwner",
                "type": "address"
            },
            {
                "name": "_minCandidateCap",
                "type": "uint256"
            },
            {
                "name": "_maxValidatorNumber",
                "type": "uint256"
            },
            {
                "name": "_candidateWithdrawDelay",
                "type": "uint256"
            },
            {
                "name": "_voterWithdrawDelay",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_voter",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_candidate",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_cap",
                "type": "uint256"
            }
        ],
        "name": "Vote",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_voter",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_candidate",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_cap",
                "type": "uint256"
            }
        ],
        "name": "Unvote",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_candidate",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_cap",
                "type": "uint256"
            }
        ],
        "name": "Propose",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "Resign",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_candidate",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_nodeId",
                "type": "string"
            }
        ],
        "name": "SetNodeId",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_blockNumber",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "_cap",
                "type": "uint256"
            }
        ],
        "name": "Withdraw",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            },
            {
                "name": "_nodeId",
                "type": "string"
            }
        ],
        "name": "propose",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "vote",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getCandidates",
        "outputs": [
            {
                "name": "",
                "type": "address[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "getCandidateCap",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "getCandidateNodeId",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "getCandidateOwner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            },
            {
                "name": "_voter",
                "type": "address"
            }
        ],
        "name": "getVoterCap",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "getVoters",
        "outputs": [
            {
                "name": "",
                "type": "address[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "isCandidate",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getWithdrawBlockNumbers",
        "outputs": [
            {
                "name": "",
                "type": "uint256[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            },
            {
                "name": "_cap",
                "type": "uint256"
            }
        ],
        "name": "unvote",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            },
            {
                "name": "_nodeId",
                "type": "string"
            }
        ],
        "name": "setNodeId",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "resign",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_blockNumber",
                "type": "uint256"
            },
            {
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
let contract = new web3.eth.Contract(ABI, '0x0000000000000000000000000000000000000088')

contract.getPastEvents('allEvents', {
    filter: {},
    fromBlock: blockInfo.startBlock,
    toBlock: blockInfo.endBlock
}, function (error, events) {
    if (error) {
        console.log('error', error)
    }
    let unVoteList = []
    let voteList = []
    for(let i = 0; i < events.length; i++) {
        let event = events[i]
        let item = {
            txHash: event.transactionHash,
            blockHash: event.blockHash,
            voter: event.returnValues._voter,
            candidate: event.returnValues._candidate,
            cap: event.returnValues._cap
        }
        if (event.event === 'Vote') {
            voteList.push(item)
        } else if (event.event === 'Unvote') {
            unVoteList.push(item)
        }
    }
    fs.writeFile('./files/voteList.json', JSON.stringify(voteList), 'utf8', function (err) {
        if (err){
            console.log('write vote list to file has problem')
        } else {
            console.log('Write vote list to file is complete')
        }
    })
    fs.writeFile('./files/unVoteList.json', JSON.stringify(unVoteList), 'utf8', function (err) {
        if (err){
            console.log('write unVote list to file has problem')
        } else {
            console.log('Write unVote list to file is complete')
        }
        process.exit(1)
    })
})