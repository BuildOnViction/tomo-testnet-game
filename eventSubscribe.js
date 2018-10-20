const Web3 = require('web3')
const config = require('config')
const fs = require('fs')
const BigNumber = require('bignumber.js')
const blockInfo = require('./files/output/startEndBlock')
const users = require('./files/input/users')

if (!('startBlock' in blockInfo ) && !('endBlock' in blockInfo)) {
    console.log('DO NOT know start & end block to check')
    process.exit(1)
}
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.get('WEB3_WS_URI')))

let ABI = require('./files/input/tomoValidator')
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
        fs.writeFile('./files/output/history/' + users[i] + '.json', JSON.stringify(history[users[i]]), 'utf8', function (err) {
            if (err){
                console.log('write file ', users[i], 'has problem')
            } else {
                console.log('Write file ', users[i], 'is complete')
            }
        })
    }

})