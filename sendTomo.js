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

async function sendTomo(listAddress) {
    let currentWallet = await web3.eth.getCoinbase()

    let listNotSuccess = []
    for (let i = 0; i < listAddress.length; i++) {
        let walletAddress = listAddress[i]

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
        } catch (e) {
            listNotSuccess.push(walletAddress)
            console.error(e)
        }
    }
    if (listNotSuccess.length > 0) {
        await sendTomo(listNotSuccess)
    }
}
async function currentProcess() {
    console.log('Start process', new Date())

    await sendTomo(users)

    console.log('End process', new Date())
    process.exit(1)
}

currentProcess()