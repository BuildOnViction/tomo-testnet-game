const Web3 = require('web3')
const config = require('config')
const fs = require('fs')
let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))
async function run() {
    let web3 = await new Web3(await new Web3.providers.WebsocketProvider(config.get('WEB3_WS_URI')))
    let startTime = new Date('2018-10-19T04:55:30.0Z')
    let endTime = new Date('2018-10-19T04:55:45.0Z')

    let startBlock = null, endBlock = null, isSetFirstBlock = false
    while (startBlock === null || endBlock === null) {
        let now = new Date()
        console.log(now, startTime, endTime, now > endTime, now > startTime)
        if (now - startTime >= 0) {
            if (!isSetFirstBlock) {
                startBlock = await web3.eth.getBlockNumber()
                console.log('GOT Start block', startBlock)
                isSetFirstBlock = true
            }
        }
        if (now - endTime >= 0) {
            endBlock = await web3.eth.getBlockNumber()
            console.log('GOT End block', endBlock)
        }

        if (startBlock !== null && endBlock !== null) {
            let content = JSON.stringify({startBlock: startBlock, endBlock: endBlock})
            console.log('start & End Block is ', content)
            fs.writeFile('./files/output/startEndBlock.json', content, 'utf8', function (err) {
                if (err){
                    console.log('write File has problem')
                } else {
                    console.log('Write file complete')
                }
                process.exit(1)
            })
        }
        console.log('Sleep 2 seconds')
        await sleep(2000)

    }
}

run()