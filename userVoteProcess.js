const fs = require('fs')

const amountEachUser = 500
let listResult = []


fs.readdirSync('./files/output/history/')
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== '.gitignore')
    })
    .forEach(function (file) {
        let userHistory = require('./files/history/' + file)
        let user = file.replace('.json', '')
        let valid = true
        let amountAvailable = amountEachUser
        let amountVote = 0

        for (let i = 0 ; i < userHistory.length; i++) {
            let event = userHistory[i]
            if (event.event === 'Vote') {
                amountAvailable -= event.cap
                amountVote += event.cap
            } else {
                amountAvailable += event.cap
                amountVote -= event.cap
            }
            if (amountAvailable < 0 || amountVote < 0 || amountVote > amountEachUser) {
                valid = false
            }
        }
        listResult.push({
            user: user,
            valid: valid,
            amountVote: amountVote,
            amountAvailable: amountAvailable
        })
    })

fs.writeFile('./files/output/userVoteAmount.json', JSON.stringify(listResult), 'utf8', function (err) {
    if (err){
        console.log('write file has problem')
    } else {
        console.log('Write file userVoteAmount.json is complete')
    }
})