const fs = require('fs')

const amountEachUser = 500
let listResult = []


fs.readdirSync('./files/output/history/')
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== '.gitignore')
    })
    .forEach(function (file) {
        let userHistory = require('./files/output/history/' + file)
        let user = file.replace('.json', '')
        let valid = true
        let amountAvailable = amountEachUser
        let amountVote = 0
        let voteNumber = 0
        let unVoteNumber = 0
        let txInvalid = null
        let amountBeforeInvalid = 0
        let amountAfterInvalid = 0

        for (let i = 0 ; i < userHistory.length; i++) {
            let event = userHistory[i]
            amountBeforeInvalid = amountAvailable
            if (event.event === 'Vote') {
                amountAvailable -= event.cap
                amountVote += event.cap
                voteNumber += 1
            } else {
                amountAvailable += event.cap
                amountVote -= event.cap
                unVoteNumber += 1
            }
            amountAfterInvalid = amountAvailable
            if (amountAvailable < 0 || amountVote < 0 || amountVote > amountEachUser) {
                valid = false
                txInvalid = event.txHash
            }
        }
        listResult.push({
            user: user,
            valid: valid,
            amountVote: amountVote,
            amountAvailable: amountAvailable,
            voteNumber: voteNumber,
            unVoteNumber: unVoteNumber,
            invalidFromTx: txInvalid,
            amountBeforeInvalid: txInvalid ? amountBeforeInvalid : null,
            amountAfterInvalid: txInvalid ? amountAfterInvalid : null,
        })
    })

fs.writeFile('./files/output/userVoteAmount.json', JSON.stringify(listResult), 'utf8', function (err) {
    if (err){
        console.log('write file has problem')
    } else {
        console.log('Write file userVoteAmount.json is complete')
    }
})