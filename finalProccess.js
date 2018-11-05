const fs = require('fs')
const config = require('config')
const BigNumber = require('bignumber.js')
const userVoteAmount = require('./files/output/userVoteAmount')
const db = require('./models')

let listResult = []
let startEpoch = 2255
let endEpoch = 2360

async function process() {
    for (let i = 0; i < userVoteAmount.length; i++) {
        let voter = userVoteAmount[i]
        console.log('Process user ', voter.user)
        let rewards = await db.Reward.find({
            address: voter.user,
            epoch: { $gte: startEpoch, $lte: endEpoch }
        })

        let total = new BigNumber(0)
        for (let i = 0; i < rewards.length; i++) {
            let rw = new BigNumber(rewards[i].reward)
            rw = rw.dividedBy(10 ** 18)
            total = total.plus(rw)
        }
        voter.totalReward = total

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

