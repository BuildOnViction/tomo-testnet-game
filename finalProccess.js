const fs = require('fs')
const config = require('config')
const axios = require('axios')
const userVoteAmount = require('./files/output/userVoteAmount')

const startBlock = config.get('STARTBLOCK')
const endBlock = config.get('ENDBLOCK')

let listResult = []
let startEpoch = Math.ceil(startBlock/config.get('BLOCK_PER_EPOCH'))
let endEpoch = Math.ceil(endBlock/config.get('BLOCK_PER_EPOCH'))

async function process() {
    for (let i = 0; i < userVoteAmount.length; i++) {
        let voter = userVoteAmount[i]
        console.log('Process user ', voter.user)
        let uri = 'http://localhost:3333/api/rewards/total/' + voter.user + '/' + startEpoch +'/' + endEpoch
        let num = await axios.get(uri)
        voter.totalReward = num.data.totalReward

        listResult.push(voter)
    }
    fs.writeFile('./files/output/result.json', JSON.stringify(listResult), 'utf8', function (err) {
        if (err){
            console.log('write file has problem')
        } else {
            console.log('Write file result.json is complete')
        }
    })
}

process()

