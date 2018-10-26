const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const config = require('config')
const NonceTrackerSubProvider = require("web3-provider-engine/subproviders/nonce-tracker")
const users = require('./files/input/userValid')

let walletProvider = new HDWalletProvider(config.get('MNEMONIC'), config.get('WEB3_URI'))
const nonceTracker = new NonceTrackerSubProvider()
walletProvider.engine._providers.unshift(nonceTracker)
nonceTracker.setEngine(walletProvider.engine)

let web3 = new Web3(walletProvider)

async function sendTomo() {
    let currentWallet = await web3.eth.getCoinbase()

    for (let i = 0; i < users.length; i++) {
        let walletAddress = users[i]

        console.log('send 0.1 TOMO from', currentWallet, 'to', walletAddress)
        try {
            let tx = await web3.eth.sendTransaction({
                to: walletAddress,
                from: currentWallet,
                value: web3.utils.toWei(String(config.get('TOMO_EACH_USER')), "ether"),
                // gas: 100000,
                gasPrice: 100000,
            })
            console.log('   tx', tx.transactionHash, new Date())
            let index = users.indexOf(walletAddress)
            if (index > -1) {
                users.splice(index, 1)
            }
        } catch (e) {
            console.error(e)
        }
    }
}
async function currentProcess() {
    console.log('Start process', new Date())
    while (users.length > 0) {
        await sendTomo()
    }
    console.log('End process', new Date())
    process.exit(1)
}

currentProcess()