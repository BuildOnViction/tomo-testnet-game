
const Web3 = require('web3')
const BigNumber = require('bignumber.js')

const db = require('./models')
const config = require('config')
const users = require('./files/input/userValid')

const TomoValidatorABI = require('./files/input/tomoValidator')

let totalReward = new BigNumber(250).multipliedBy(10 ** 18)
let voterRewardPercent = new BigNumber(50)
let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

async function calculate(epoch) {
    let web3 = await new Web3(await new Web3.providers.HttpProvider(config.get('WEB3_URI')))
    let validatorContract = await new web3.eth.Contract(TomoValidatorABI, '0x0000000000000000000000000000000000000088')
    let totalSignNumber = 0
    let endBlock = parseInt(epoch) * config.get('BLOCK_PER_EPOCH')
    let startBlock = endBlock - config.get('BLOCK_PER_EPOCH') + 1

    let validators = await validatorContract.methods.getCandidates().call()
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

        let blockRewardCalculate = (epoch + 1) * config.get('BLOCK_PER_EPOCH')

        let timestamp = new Date()
        let _block = await web3.eth.getBlock(blockRewardCalculate)
        if (_block) {
            timestamp = _block.timestamp * 1000
        }

        console.log('Process reward for voter of validator', validator.address, ' at epoch: ', epoch)
        await reward(epoch, validator.address, validator.signNumber, reward4voter.toString(), timestamp)

        console.log('sleep 0.2 seconds')
        await sleep(2000)
    })
    await Promise.all(validatorFinal)
}

async function reward(epoch, validatorAddress, validatorSignNumber, totalRewardVoter, rewardTime) {
    totalRewardVoter = new BigNumber(totalRewardVoter)

    let endBlock = parseInt(epoch) * config.get('BLOCK_PER_EPOCH')
    let startBlock = endBlock - config.get('BLOCK_PER_EPOCH') + 1

    try {
        let web3 = await new Web3(await new Web3.providers.HttpProvider(config.get('WEB3_URI')))
        let validatorContract = await new web3.eth.Contract(TomoValidatorABI, '0x0000000000000000000000000000000000000088')

        let voters = await validatorContract.methods.getVoters(validatorAddress).call()

        let totalVoterCap = await validatorContract.methods.getCandidateCap(validatorAddress).call()
        totalVoterCap = new BigNumber(totalVoterCap)
        let listVoters = []
        let voterMap = voters.map(async (voter) => {
            voter = voter.toString().toLowerCase()
            if (users.indexOf(voter) > -1) {
                let voterCap = await validatorContract.methods.getVoterCap(validatorAddress, voter).call()
                voterCap = new BigNumber(voterCap)
                listVoters.push({
                    address: voter,
                    balance: voterCap
                })
            }
        })
        await Promise.all(voterMap)

        let rewardVoter = []

        let listVoterMap = listVoters.map(async (voter) => {
            if (voter.balance.toString() !== '0') {
                let voterAddress = voter.address.toString().toLowerCase()
                let reward = totalRewardVoter.multipliedBy(voter.balance).dividedBy(totalVoterCap)

                await rewardVoter.push({
                    epoch: epoch,
                    startBlock: startBlock,
                    endBlock: endBlock,
                    address: voterAddress,
                    validator: validatorAddress,
                    reason: 'Voter',
                    lockBalance: voter.balance.toString(),
                    reward: reward.toString(),
                    rewardTime: rewardTime,
                    signNumber: validatorSignNumber
                })
            }

            if (rewardVoter.length === 5000) {
                await db.Reward.insertMany(rewardVoter)
                rewardVoter = []
            }
        })
        await Promise.all(listVoterMap)
        if (rewardVoter.length > 0) {
            await db.Reward.insertMany(rewardVoter)
        }
    } catch (e) {
        console.error('kkkkkkk', epoch, validatorAddress)
        await reward(epoch, validatorAddress, validatorSignNumber, totalRewardVoter, rewardTime)
        // console.error(e)
    }
}
 async function run() {
     for (let i = 2255; i < 2360; i++) {
         await calculate(i)
     }
     process.exit(1)
 }

run()