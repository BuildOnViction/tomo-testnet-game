# tomo-testnet-game
A game for voting Masternode on TomoChain Testnet https://testnet.tomochain.com 

# Before start
Copy config file and update
```
cp config/default.json config.local.json
```
`MNEMONIC`: Account send TOMO to list user valid

`STARTBLOCK`: block when start game, it need equal `901 * n`

`ENDBLOCK`: block when finish game, it need equal `900 * n`

`TOMO_EACH_USER`: amount send to user

# How to get result
### 1. Check valid user
From list input user, we will check user valid in list. 
We only accept user never voter for a master node before (or unvote before this process) 

We can check by command

```
node validUser.js
```

- Input `files/input/users.json`
- Output `files/input/userValid.json`

### 2. Send 1001 TOMO for each user
It mean 1000 TOMO for vote, 1 for transfer fee
- Input `files/input/userValid.json`

### 3. Get user vote history 
```
node userHistoryProcess.js
```
- Input:
    + Contract ABI `files/intput/tomoValidator.json`
    + User valid `files/input/userValid.json`
- Output: List file in dir `files/output/history`

### 4. Check user vote is valid
It mean every user in list can only vote less than or equal `1,000 TOMO` in ` testnet`
```
node userVoteProcess.js
```
- Input: List file in dir `files/output/history`
- Output: `files/output/userVoteAmount.json`

### 5. Final process
We will have list result, How many reward each user
- Input: `files/output/userVoteAmount.json`
- Output: `files/output/result.json`