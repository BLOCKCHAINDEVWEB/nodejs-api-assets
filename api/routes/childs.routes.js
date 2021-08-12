import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import { ethers } from 'ethers'
import KoChildAbi from '../artifacts/tokenNFT.json'
import { chainId, token, getTxDataTransfer, estimateFeeGas } from '../controlers/nftsController'

const router = express.Router()
const { name, version } = token
const { chainMumbai } = chainId
dotenv.config({ path: path.join(__dirname, '../../.env') })

// polygon node url
const nftChild = '0x3E436530Ba524694a1657AF26bab51839F34f738'
const privateKey = process.env.PRIVATE_KEY
const maticProvider = 'https://rpc-mumbai.maticvigil.com/v1/339bfd1060db13f0f39cac79e2cca45b637c93e9'
const providerChild = new ethers.providers.JsonRpcProvider(maticProvider)

const walletChild = new ethers.Wallet(privateKey)
const signerChild = walletChild.connect(providerChild)
const childContract = new ethers.Contract(nftChild , KoChildAbi , signerChild)

router.post('/mint', async (req, res) => {
  try {
    const { from, upload, name, symbol, description } = req.body

    // require new ChildMintablableERC721(name_, symbol_)
    // pinata pin image
    // pinata pin json metadata
    // ipfs return multihash

    const hash = 'QmaQNPLWTSKNXCvzURSi3WrkywJ1qcnYC56Dw1XMrxYZ7Z'
    const URI = `ipfs://${hash}`

    const resp = await childContract.mintable(from, URI)
    const tx = await resp.wait()
    const tokenId = tx.events[0].args[2].toNumber()

    res.status(200).json({ status: 'success', tokenId: tokenId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/execMetadata', async (req, res) => {
  try {
    const { from, to, tokenId } = req.body
    const msgParams = {
      name: name,
      version: version,
      childAddress: nftChild,
      from,
      to,
      tokenId: Number(tokenId)
    }
  
    const { fctSign, r, s, v } = await getTxDataTransfer(childContract, msgParams, privateKey)

    const sigR = '0x'.concat(r.toString('hex'))
    const sigS = '0x'.concat(s.toString('hex'))
    const sigV = v
  
    const dataTx = { from, fctSign, sigR, sigS, sigV }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    const tx = await childContract.executeMetaTransaction(from, fctSign, sigR, sigS, sigV, {
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

router.post('/transfer', async (req, res) => {
  try {
    const { from, to, tokenId } = req.body
    const tx = await childContract.transferFrom(from, to, Number(tokenId), {
      from: from
    })
    console.log("NFT transferred:", tx.hash)
    console.log("Tx nonce:", tx.nonce)

    res.status(200).json({ status: 'success', txHash: tx.hash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/burn', async (req, res) => {
  try {
    const { from, tokenId } = req.body
    const burnTx = await childContract.withdraw(tokenId, {
      from: from
    })
    console.log(burnTx.transactionHash)

    res.status(200).json({ status: 'success', txHash: burnTx.transactionHash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router