const Web3 = require('web3')
const config = require('config')
const BigNumber = require('bignumber.js')
const db = require('./models')


let web3 = new Web3(new Web3.providers.WebsocketProvider(config.get('WEB3_WS_URI')))

let ABI = require('./files/input/tomoValidator')
let contract = new web3.eth.Contract(ABI, '0x0000000000000000000000000000000000000088')


let defaultValidator = [
    {
        txHash: null,
        blockNumber: 1,
        event: 'Propose',
        blockHash: null,
        voter: '0x487d62d33467c4842c5e54eb370837e4e88bba0f',
        owner: '0x487d62d33467c4842c5e54eb370837e4e88bba0f',
        candidate: '0xfc5571921c6d3672e13b58ea23dea534f2b35fa0',
        cap: 50000
    },
    {
        txHash: null,
        blockNumber: 1,
        event: 'Propose',
        blockHash: null,
        voter: '0x487d62d33467c4842c5e54eb370837e4e88bba0f',
        owner: '0x487d62d33467c4842c5e54eb370837e4e88bba0f',
        candidate: '0xf99805b536609cc03acbb2604dfac11e9e54a448',
        cap: 50000
    },
    {
        txHash: null,
        blockNumber: 1,
        event: 'Propose',
        blockHash: null,
        voter: '0x487d62d33467c4842c5e54eb370837e4e88bba0f',
        owner: '0x487d62d33467c4842c5e54eb370837e4e88bba0f',
        candidate: '0x31b249fe6f267aa2396eb2dc36e9c79351d97ec5',
        cap: 50000
    },
]
db.VoteHistory.insertMany(defaultValidator)

contract.getPastEvents('allEvents', {
    filter: {},
    fromBlock: 0,
    toBlock: 2205900
}, function (error, events) {
    if (error) {
        console.log('error', error)
    }
    let listVoteUnVote = []
    console.log('there are %s events', events.length)
    for(let i = 0; i < events.length; i++) {
        let event = events[i]
        let voter = String(event.returnValues._voter || '').toLowerCase()
        let owner = String(event.returnValues._owner || '').toLowerCase()
        let candidate = String(event.returnValues._candidate || '').toLowerCase()
        let cap = new BigNumber(event.returnValues._cap || 0)
        let capTomo = cap.dividedBy(10 ** 18)
        BigNumber.config({ EXPONENTIAL_AT: [-100, 100] })
        let item = {
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            event: event.event,
            blockHash: event.blockHash,
            voter: voter,
            owner: owner,
            candidate: candidate,
            cap: capTomo.toNumber()
        }
        listVoteUnVote.push(item)
        if (listVoteUnVote.length >= 5000) {
            db.VoteHistory.insertMany(listVoteUnVote)
            listVoteUnVote = []
        }
    }
    if (listVoteUnVote.length > 0) {
        db.VoteHistory.insertMany(listVoteUnVote)
    }
})