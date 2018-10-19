const Web3 = require('web3')
const config = require('config')
const fs = require('fs')
const BigNumber = require('bignumber.js')
const blockInfo = require('./files/startEndBlock')
const users = require('./files/users')

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

let history = {}
for (let i = 0; i < users.length; i++) {
    history[users[i]] = []
}

contract.getPastEvents('allEvents', {
    filter: {},
    fromBlock: blockInfo.startBlock,
    toBlock: blockInfo.endBlock
}, function (error, events) {
    if (error) {
        console.log('error', error)
    }
    let listVoteUnVote = []
    for(let i = 0; i < events.length; i++) {
        let event = events[i]
        let voter = String(event.returnValues._voter).toLowerCase()
        let candidate = String(event.returnValues._candidate).toLowerCase()
        let cap = new BigNumber(event.returnValues._cap)
        let capTomo = cap.dividedBy(10 ** 18)
        BigNumber.config({ EXPONENTIAL_AT: [-100, 100] })
        if (users.indexOf(voter) >= 0){            
            let item = {
                txHash: event.transactionHash,
                blockNumber: event.blockNumber,
                event: event.event,
                blockHash: event.blockHash,
                voter: voter,
                candidate: candidate,
                cap: capTomo.toNumber()
            }
            history[voter].push(item)

        }
    }
    for (let i = 0; i < users.length; i++) {
        fs.writeFile('./files/history/' + users[i] + '.json', JSON.stringify(history[users[i]]), 'utf8', function (err) {
            if (err){
                console.log('write file ', users[i], 'has problem')
            } else {
                console.log('Write file ', users[i], 'is complete')
            }
        })
    }

})