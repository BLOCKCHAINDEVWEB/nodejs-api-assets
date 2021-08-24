import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import { ethers } from 'ethers'
import config from '../../config'
import { estimateFeeGas } from '../controlers/nftsController'

const router = express.Router()
const abiCoder = new ethers.utils.AbiCoder()
dotenv.config({ path: path.join(__dirname, '../../.env') })

// goerli node url
const ethereumProvider = config.root.RPC
const rootChainAddress = config.root.POSRootChainManager // RootChainManagerProxy
const providerParent = new ethers.providers.JsonRpcProvider(ethereumProvider)

// Create a wallet instance
const privateKey = process.env.PRIVATE_KEY
const walletParent = new ethers.Wallet(privateKey)
const signerParent = walletParent.connect(providerParent)

router.post('/deposit-for', async (req, res) => {
  try {
    const { userAddress, rootToken, tokenId } = req.body
    const abi = ['function depositFor(address user, address rootToken, bytes calldata depositData) external']
    const rootChainManager = new ethers.Contract(rootChainAddress, abi, signerParent)

    const depositData = abiCoder.encode(['uint256'], [tokenId])
    // console.log(depositData)
    // console.log(Number(abiCoder.decode(['uint256'], depositData)))
    // const depositData = ethers.utils.defaultAbiCoder.encode(['uint256'], [tokenId])

    const dataTx = { userAddress, rootToken, depositData }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerParent, dataTx)

    const tx = await rootChainManager.depositFor(userAddress, rootToken, depositData, {
      from: userAddress,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    // const receipt = await tx.wait()
    // console.log(receipt)
    console.log(tx)

    res.status(200).json({ status: 'success' })
    // res.status(200).json({ status: 'success', txHash: tx.hash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
