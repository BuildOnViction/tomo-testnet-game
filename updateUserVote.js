const db = require('./models')

async function main() {
    let lastRow = await db.UserVoteAmount.findOne().sort({epoch: -1})
    if (lastRow) {
        let lastEpoch = lastRow.epoch
        for (let i = 0; i<= lastEpoch; i++) {
            console.log('Process epoch', i)
            let voteInEpoch = await db.UserVoteAmount.find({epoch: i})
            let data = []
            for (let j = 0; j < voteInEpoch.length; j++) {
                if (i < lastEpoch) {
                    let nextEpoch = await db.UserVoteAmount.findOne({
                        voter: voteInEpoch[j].voter,
                        epoch: voteInEpoch[j].epoch + 1,
                        candidate: voteInEpoch[j].candidate
                    })
                    if (!nextEpoch) {
                        data.push({
                            voter: voteInEpoch[j].voter,
                            epoch: voteInEpoch[j].epoch + 1,
                            voteAmount: voteInEpoch[j].voteAmount,
                            candidate: voteInEpoch[j].candidate
                        })
                    }
                }

            }
            if (data.length > 0) {
                console.log('  Duplicate in next epoch')
                await db.UserVoteAmount.insertMany(data)
            }
        }
    }
    process.exit(1)
}

main()