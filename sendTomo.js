const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const config = require('config')
const NonceTrackerSubProvider = require("web3-provider-engine/subproviders/nonce-tracker")
const users = require('./files/users')

let walletProvider = new HDWalletProvider(config.get('MNEMONIC'), config.get('WEB3_URI'))
const nonceTracker = new NonceTrackerSubProvider()
walletProvider.engine._providers.unshift(nonceTracker)
nonceTracker.setEngine(walletProvider.engine)

let web3 = new Web3(walletProvider)

async function sendTomo() {
    console.log('Start process', new Date())
    let currentWallet = await web3.eth.getCoinbase()

    for (let i = 0; i < users.length; i++) {
        let walletAddress = users[i]
        if (! (await web3.utils.isAddress(walletAddress))) {
            continue
        }

        console.log('send 0.1 TOMO from', currentWallet, 'to', walletAddress)
        let tx = await web3.eth.sendTransaction({
            to: walletAddress,
            from: currentWallet,
            value: web3.utils.toWei('0.1', "ether"),
            // gas: 100000,
            gasPrice: 100000,
        })
        console.log('   tx', tx.transactionHash, new Date())
    }
    console.log('End process', new Date())
    process.exit(1)
}

sendTomo()