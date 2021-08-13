import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import { ethers } from 'ethers'
import KoRootAbi from '../artifacts/KoMintableERC721.json'
import RootChainAbi from '../artifacts/RootChainManagerProxy.json'
import { chainId, token, getTxDataTransfer, estimateFeeGas } from '../controlers/nftsController'

const router = express.Router()
const { name, version } = token
const { chainMumbai } = chainId
dotenv.config({ path: path.join(__dirname, '../../.env') })

const nftRoot = '0xD40E37CE46CA1dFffd506253fCfFD657045300Dc'
const predicate = '0x56E14C4C1748a818a5564D33cF774c59EB3eDF59'
const privateKey = process.env.PRIVATE_KEY

const ethereumProvider = `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
const providerParent = new ethers.providers.JsonRpcProvider(ethereumProvider)

// Create a wallet instance
const walletParent = new ethers.Wallet(privateKey)
const signerParent = walletParent.connect(providerParent)
const rootContract = new ethers.Contract(nftRoot, KoRootAbi, signerParent)
const rootChainManager = new ethers.Contract(predicate, RootChainAbi, signerParent)

router.post('/grantRole', async (req, res) => {
  try {
    const { from, role, address } = req.body  // bytes32 & PREDICATE_ROLE
    const resp = await rootContract.grantRole(role, address, {
      from: from,
    })
    console.log(resp)

    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Fail with error 'ERC721: owner query for nonexistent token'
router.post('/approve', async (req, res) => {
  try {
    const { from, tokenId } = req.body

    const dataTx = { predicate, tokenId }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerParent, dataTx)

    const tx = await rootContract.approve(predicate, tokenId, {
      from: from,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    console.log(tx)

    res.status(200).json({ status: 'success', txHash: tx.hash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/deposit', async (req, res) => {
  try {
    const { userAddress, rootToken, tokenId } = req.body

    const depositData = ethers.encodeParameter('uint256', tokenId)
    const dataTx = { userAddress, rootToken, depositData }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerParent, dataTx)

    const tx = await rootChainManager.depositFor(userAddress, rootToken, depositData, {
      from: userAddress,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    console.log(tx)

    res.status(200).json({ status: 'success', txHash: tx.hash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router