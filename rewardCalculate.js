const BigNumber = require('bignumber.js')
const db = require('./models')
const config = require('config')

let totalReward = new BigNumber(250)
let voterRewardPercent = new BigNumber(50)

async function calculate(epoch) {
    let totalSignNumber = 0
    let endBlock = parseInt(epoch) * config.get('BLOCK_PER_EPOCH')
    let startBlock = endBlock - config.get('BLOCK_PER_EPOCH') + 1

    let validators = []
    let voteHistory = await db.UserVoteAmount.find({epoch: epoch})
    for (let i = 0; i < voteHistory.length; i++) {
        if (validators.indexOf(voteHistory[i].candidate) < 0) {
            validators.push(voteHistory[i].candidate)
        }
    }
    let validatorSigners = []
    let validatorMap = validators.map(async (validator) => {
        validator = validator.toString().toLowerCase()
        let validatorSignNumber = await db.BlockSigner
            .countDocuments({
                blockNumber: { $gte: startBlock, $lte: endBlock },
                signers: validator
            })
        if (validatorSignNumber > 0) {
            totalSignNumber += validatorSignNumber
            validatorSigners.push({
                address: validator,
                signNumber: validatorSignNumber
            })
        }
    })
    await Promise.all(validatorMap)

    let validatorFinal = validatorSigners.map(async (validator) => {
        let reward4group = totalReward.multipliedBy(validator.signNumber).dividedBy(totalSignNumber)
        let reward4voter = reward4group.multipliedBy(voterRewardPercent).dividedBy(100)
        // console.log('total reward for group vl %s is %s, for voter is %s', validator.address, reward4group.toString(), reward4voter.toString())

        let timestamp = new Date()

        console.log('Process reward for voter of validator', validator.address, ' at epoch: ', epoch)
        await reward(epoch, validator.address, validator.signNumber, reward4voter.toString(), timestamp)

    })
    await Promise.all(validatorFinal)
}

async function reward(epoch, validatorAddress, validatorSignNumber, totalRewardVoter, rewardTime) {
    totalRewardVoter = new BigNumber(totalRewardVoter)

    let endBlock = parseInt(epoch) * config.get('BLOCK_PER_EPOCH')
    let startBlock = endBlock - config.get('BLOCK_PER_EPOCH') + 1

    let voteEpoch = await db.UserVoteAmount.find({epoch: epoch, candidate: validatorAddress})
    let totalVoterCap = 0
    for (let i=0; i< voteEpoch.length; i++) {
        totalVoterCap += voteEpoch[i].voteAmount
    }
    // console.log('total voter cap', totalVoterCap, validatorAddress)
    totalVoterCap = new BigNumber(totalVoterCap)


    let rewardVoter = []
    for (let i=0; i< voteEpoch.length; i++) {
        let voterAddress = voteEpoch[i].voter
        let voterAmount = new BigNumber(voteEpoch[i].voteAmount)
        if (String(voterAmount) !== '0') {
            let reward = totalRewardVoter.multipliedBy(voterAmount).dividedBy(totalVoterCap)
            // console.log('voter %s vote for validator %s has reward %s', voterAddress, validatorAddress, reward.toString())

            await rewardVoter.push({
                epoch: epoch,
                startBlock: startBlock,
                endBlock: endBlock,
                address: voterAddress,
                validator: validatorAddress,
                reason: 'Voter',
                lockBalance: voterAmount.toString(),
                reward: reward.toString(),
                rewardTime: rewardTime,
                signNumber: validatorSignNumber
            })
            if (rewardVoter.length === 5000) {
                await db.Reward.insertMany(rewardVoter)
                rewardVoter = []
            }
        }

    }

    if (rewardVoter.length > 0) {
        await db.Reward.insertMany(rewardVoter)
    }
}
 async function run() {
     for (let i = 1; i <= 2482; i++) {
         await calculate(i)
     }
     process.exit(1)
 }

run()