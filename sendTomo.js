const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const config = require('config')
const NonceTrackerSubProvider = require("web3-provider-engine/subproviders/nonce-tracker")

let walletProvider = new HDWalletProvider(config.get('MNEMONIC'), config.get('WEB3_URI'))
const nonceTracker = new NonceTrackerSubProvider()
walletProvider.engine._providers.unshift(nonceTracker)
nonceTracker.setEngine(walletProvider.engine)

let web3 = new Web3(walletProvider)

async function sendTomo() {
    console.log('Start process', new Date())
    let listAdd = [
        "0x487d62d33467c4842c5e54eb370837e4e88bba0f",
        "0xfe1c468eb19b6d15ecf18af0426df7c4746a8875",
        "0xe4c3095efdd7163b86d745ad5c6d718a859eec9f",
        "0xd5478df3c04f389749282c2844740e93ca6b09cb",
        "0x47df55b76cd8cee0b0553f637b3b41dbdaf45cf1",
        "0xc902cc2505faf4537e6252c1ec30a992748bc0d4",
        "0xa23cebfe11b4b81476b3a1d1516e6da6608585aa",
        "0xca0f0f65369a6034b094c7fbf3ba855165da951b",
        "0x6589b842c40cba19be4db7e9ce56329d8ea5c688",
        "0xb473edf564da4419b1e9e8b6974dfdb610094c14",
    ]
    let currentWallet = await web3.eth.getCoinbase()

    for (let i = 0; i < listAdd.length; i++) {
        let walletAddress = listAdd[i]
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