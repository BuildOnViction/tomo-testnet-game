const fs = require('fs')
const config = require('config')
const BigNumber = require('bignumber.js')
const userValid = require('./files/input/userValid')
const db = require('./models')

let listResult = []
let startEpoch = 2255
let endEpoch = 2400

async function main() {
    for (let i = 0; i < userValid.length; i++) {
        let voter = {}
        voter.user = userValid[i]
        console.log('Process user ', voter.user)
        let rewards = await db.Reward.find({
            address: voter.user,
            epoch: { $gte: startEpoch, $lte: endEpoch }
        })

        let total = new BigNumber(0)
        for (let i = 0; i < rewards.length; i++) {
            let rw = new BigNumber(rewards[i].reward)
            if (rw.toString() === 'NaN') {
                console.log(rewards[i])
            }
            rw = rw
            total = total.plus(rw)
        }
        voter.totalReward = total.toNumber()

        listResult.push(voter)
    }
    fs.writeFile('./files/output/result.json', JSON.stringify(listResult), 'utf8', function (err) {
        if (err){
            console.log('write file has problem')
        } else {
            console.log('Write file result.json is complete')
        }
        process.exit(1)
    })
}

main()

