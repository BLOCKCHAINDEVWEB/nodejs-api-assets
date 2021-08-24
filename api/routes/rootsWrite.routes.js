import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import { ethers } from 'ethers'
import config from '../../config'
import KoRoot4 from '../artifacts4/KoMintableERC721.json'
import KoRoot5 from '../artifacts5/KoMintableERC721.json'
import KoRoot6 from '../artifacts6/KoMintableERC721.json'
import { estimateFeeGas } from '../controlers/nftsController'


const router = express.Router()
const abiCoder = new ethers.utils.AbiCoder()
dotenv.config({ path: path.join(__dirname, '../../.env') })

// goerli node url
const nftRoot = config.root.DERC721 // tokens address deploy
const ERC721Predicate = config.root.posERC721Predicate  // ERC721PredicateProxy
const ethereumProvider = config.root.RPC
const providerParent = new ethers.providers.JsonRpcProvider(ethereumProvider)

// Create a wallet instance
const privateKey = process.env.PRIVATE_KEY
const walletParent = new ethers.Wallet(privateKey)
const signerParent = walletParent.connect(providerParent)

router.post('/grantRole', async (req, res) => {
  try {
    const { from, rootToken, predicate, role } = req.body  // bytes32 & PREDICATE_ROLE
    const rootContract = new ethers.Contract(rootToken, KoRoot5.abi, signerParent)

    const resp = await rootContract.grantRole(role, predicate, {
      from: from,
    })
    console.log(resp)

    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/approve', async (req, res) => {
  try {
    const { from, rootToken, tokenId } = req.body
    const rootContract = new ethers.Contract(rootToken, KoRoot5.abi, signerParent)

    const depositData = abiCoder.encode(['uint256'], [tokenId])

    const dataTx = { ERC721Predicate, depositData }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerParent, dataTx)

    const tx = await rootContract.approve(ERC721Predicate, tokenId, {
      from: from,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    console.log(tx)

    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/approve-predicate', async (req, res) => {
  try {
    const { from, rootToken, predicate, tokenId } = req.body
    const rootContract = new ethers.Contract(rootToken, KoRoot5.abi, signerParent)

    const depositData = abiCoder.encode(['uint256'], [tokenId])

    const dataTx = { predicate, depositData }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerParent, dataTx)

    const tx = await rootContract.approve(predicate, tokenId, {
      from: from,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    console.log(tx)

    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/approval-all', async (req, res) => {
  try {
    const { from, operator, approved } = req.body
    const rootContract = new ethers.Contract(operator , KoRoot5.abi , signerParent)

    const dataTx = { operator, approved }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerParent, dataTx)

    const approve = await rootContract.setApprovalForAll(operator, approved, {
      from,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    console.log(approve)

    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/deposit', async (req, res) => {
  try {
    const { userAddress, rootToken, tokenId } = req.body
    const abi = ['function deposit(address user, address rootToken, bytes calldata depositData) external']
    const rootContract = new ethers.Contract(rootToken, abi, signerParent)

    // const tokenIdBN = new ethers.BigNumber.from(tokenId)
    // console.log(tokenIdBN)
    const depositData = abiCoder.encode(['uint256'], [tokenId])
    // console.log(depositData)
    // console.log(Number(abiCoder.decode(['uint256'], depositData)))

    const dataTx = { userAddress, rootToken, depositData }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerParent, dataTx)

    const tx = await rootContract.deposit(userAddress, rootToken, depositData, {
      from: userAddress,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    console.log(tx)

    res.status(200).json({ status: 'success' })
    // res.status(200).json({ status: 'success', txHash: tx.hash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
