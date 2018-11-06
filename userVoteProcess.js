const db = require('./models')

async function main() {

    let histories = await db.VoteHistory.find().sort({blockNumber: 1})

    console.log('There are %s histories', histories.length)
    for (let i = 0; i < histories.length; i++) {
        let history = histories[i]
        console.log('process item %s event %s, voter %s, amount %s', i, history.event, history.voter, history.cap)

        if (history.event === 'Propose') {
            let data = {
                voter: history.owner,
                candidate: history.candidate,
                epoch: Math.ceil(history.blockNumber/900),
                voteAmount: history.cap
            }
            await db.UserVoteAmount.create(data)
        } else if (history.event === 'Vote') {
            let h = await db.UserVoteAmount.findOne({
                voter: history.voter,
                candidate: history.candidate
            }).sort({epoch: -1})
            await db.UserVoteAmount.findOneAndUpdate({
                voter: history.voter,
                candidate: history.candidate,
                epoch: Math.floor(history.blockNumber/900)
            }, {
                voteAmount: (h ? h.voteAmount : 0) + history.cap
            }, { upsert: true, new: true })

        } else if (history.event === 'Unvote') {
            let h = await db.UserVoteAmount.findOne({
                voter: history.voter,
                candidate: history.candidate
            }).sort({epoch: -1})
            await db.UserVoteAmount.updateOne({
                voter: history.voter,
                candidate: history.candidate,
                epoch: Math.floor(history.blockNumber/900)
            }, {
                voteAmount: (h ? h.voteAmount : 0) - history.cap
            }, { upsert: true, new: true })

        } else if (history.event === 'Resign') {
            let h = await db.UserVoteAmount.findOne({
                voter: history.voter,
                candidate: history.candidate
            }).sort({epoch: -1})
            await db.UserVoteAmount.updateOne({
                voter: history.voter,
                candidate: history.candidate,
                epoch: Math.ceil(history.blockNumber/900)
            }, {
                voteAmount: (h ? h.voteAmount : 0) - history.cap
            }, { upsert: true, new: true })
        }
    }
    process.exit(1)
}

main()