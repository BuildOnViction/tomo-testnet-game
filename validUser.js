const Web3 = require('web3')
const config = require('config')
const fs = require('fs')
const ABI = require('./files/input/tomoValidator')
const users = require('./files/input/users')

async function run() {
    let web3 = await new Web3(await new Web3.providers.HttpProvider(config.get('WEB3_URI')))

    let contract = new web3.eth.Contract(ABI, '0x0000000000000000000000000000000000000088')

    let validators = await contract.methods.getCandidates().call()
    let userValid = []
    for (let i = 0; i < users.length; i++) {
        let isValid = true
        let user = users[i]
        if (! (await web3.utils.isAddress(user))) {
            continue
        }
        console.log('process user', user)
        for (let j = 0; j < validators.length; j++) {
            let validator = String(validators[j]).toLowerCase()
            console.log('  process validator', validator)
            let voterBalance = await contract.methods.getVoterCap(validator, user).call()
            if (voterBalance !== '0') {
                isValid = false
                break
            }
        }
        if (isValid) {
            userValid.push(user)
        }
    }
    fs.writeFile('./files/input/userValid.json', JSON.stringify(userValid), 'utf8', function (err) {
        if (err){
            console.log('write file has problem')
        } else {
            console.log('Write file userValid.json is complete')
        }
    })
}
run()