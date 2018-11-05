const Web3 = require('web3')
const config = require('config')
const BlockSignerABI = require('./files/input/BlockSigner')
const db = require('./models')


async function calculate() {
    // console.log(11, new Date())
    let web3 = await new Web3(await new Web3.providers.HttpProvider(config.get('WEB3_URI')))
    let bs = await new web3.eth.Contract(BlockSignerABI, '0x0000000000000000000000000000000000000089')
    for (let i = 2178599; i < 2199999; i++) {
        // console.log('Process block', i)
        let block = await web3.eth.getBlock(i)
        if (!block) {
            process.exit(1)
        }
        let blockHash = block.hash
        // console.log(222, new Date())
        let ss = await bs.methods.getSigners(blockHash).call()
        // console.log(333, new Date())
        await db.BlockSigner.updateOne({
            blockHash: blockHash,
            blockNumber: i
        }, {
            $set: {
                blockHash: blockHash,
                blockNumber: i,
                signers: ss.map(it => (it || '').toLowerCase())
            }
        }, {
            upsert: true
        }).then(function () {
            console.log('process block ', i, new Date())
        })
    }
}

calculate()