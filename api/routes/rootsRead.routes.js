import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import { ethers } from 'ethers'
import config from '../../config'
import KoRoot4 from '../artifacts4/KoMintableERC721.json'
import KoRoot5 from '../artifacts5/KoMintableERC721.json'
import KoRoot6 from '../artifacts6/KoMintableERC721.json'
import { chainId, token, getTxDataTransfer, estimateFeeGas } from '../controlers/nftsController'

const router = express.Router()
const { name, version } = token
const { chainMumbai } = chainId
const abiCoder = new ethers.utils.AbiCoder()
dotenv.config({ path: path.join(__dirname, '../../.env') })

// goerli node url
const nftRoot = config.root.DERC721 // tokens address deploy
const predicate = config.root.posMintableERC721Predicate  // MintableERC721PredicateProxy"
const ethereumProvider = config.root.RPC
const providerParent = new ethers.providers.JsonRpcProvider(ethereumProvider)

// Create a wallet instance
const privateKey = process.env.PRIVATE_KEY
const walletParent = new ethers.Wallet(privateKey)

router.post('/owner-of', async (req, res) => {
  try {
    const { from, rootToken, tokenId } = req.body
    const signerParent = walletParent.connect(providerParent)
    const rootContract = new ethers.Contract(rootToken, KoRoot5.abi, signerParent)

    const ownerOf = await rootContract.ownerOf(tokenId)
    console.log(ownerOf)

    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/events', async (req, res) => {
  try {
    const { from, rootToken, tokenId } = req.body
    const rootContract = new ethers.Contract(rootToken, KoRoot5.abi, providerParent.getSigner(0))

    // const transferAbi = ["Transfer(address,address,uint256)"]
    // const iTransferFct = new ethers.utils.Interface(transferAbi)
    // const fctSign = iTransferFct.encodeFunctionData("Transfer", [from, to, tokenId])
    // ethers (hash of a string)
    // const topic = new ethers.utils.id("Transfer(address,address,uint256)")
    // console.log(topic)

    const approvalAbi = ["event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)"]
    const contract = new ethers.Contract(rootToken, approvalAbi, providerParent)
    console.log(contract.filters.Approval(from, from, 5))
    let filter 
    filter = contract.filters.Approval()
    filter.fromBlock = await providerParent.getBlockNumber()
    filter.toBlock = 'latest'

    const result = await providerParent.getLogs(filter)
    console.log(result)

    // const logs = await providerParent.getLogs({
    //   fromBlock: 5341795,
    //   toBlock: 'latest',
    //   topics: contract.filters.Approval(from).topics
    // })
    // console.log(logs)

    // const events = rootContract.getPastEvents('allEvents', {
    //   fromBlock: 5341795,
    //   toBlock: 'latest'
    // })
    // console.log(events)


    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/balance', async (req, res) => {
  try {
    const { from, rootToken } = req.body
    const rootContract = new ethers.Contract(rootToken, KoRoot5.abi, providerParent)
    const balanceOf = Number(await rootContract.balanceOf(from))

    res.status(200).json({ status: 'success', balanceOf: balanceOf })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/total-supply', async (req, res) => {
  try {
    const { rootToken } = req.body
    const rootContract = new ethers.Contract(rootToken, KoChild5.abi, providerChild)
    const totalSupply = Number(await rootContract.totalSupply())

    res.status(200).json({ status: 'success', totalSupply: totalSupply })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/is-approval-all', async (req, res) => {
  try {
    const { rootToken, owner, operator } = req.body
    const rootContract = new ethers.Contract(rootToken, KoChild5.abi, providerChild)
    const isApproval = await rootContract.isApprovedForAll(owner, operator)

    res.status(200).json({ status: 'success', isApproval: isApproval })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
