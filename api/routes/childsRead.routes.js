import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import { ethers } from 'ethers'
import config from '../../config'
import KoChild4 from '../artifacts4/tokenNFT.json'
import KoChild5 from '../artifacts5/tokenNFT.json'


const router = express.Router()
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// polygon node url
const maticProvider = config.child.RPC
const providerChild = new ethers.providers.JsonRpcProvider(maticProvider)

router.post('/details', async (req, res) => {
  try {
    const { nftAddress } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, providerChild)
    const name = await childContract.name()
    const symbol = await childContract.symbol()
    const baseURI = await childContract.baseURI()

    res.status(200).json({ status: 'success', name: name, symbol: symbol, baseURI: baseURI })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/balance', async (req, res) => {
  try {
    const { owner, nftAddress } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, providerChild)
    const balanceOf = Number(await childContract.balanceOf(owner))

    res.status(200).json({ status: 'success', balanceOf: balanceOf })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/tokenURI', async (req, res) => {
  try {
    const { nftAddress, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, providerChild)
    const tokenURI = await childContract.tokenURI(tokenId)

    res.status(200).json({ status: 'success', tokenURI: tokenURI })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/tokenByIndex', async (req, res) => {
  try {
    const { owner, nftAddress, index } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, providerChild)
    const tokenByIndex = Number(await childContract.tokenOfOwnerByIndex(owner, index))

    res.status(200).json({ status: 'success', tokenByIndex: tokenByIndex })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/total-supply', async (req, res) => {
  try {
    const { nftAddress } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, providerChild)
    const totalSupply = Number(await childContract.totalSupply())

    res.status(200).json({ status: 'success', totalSupply: totalSupply })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/is-approval-all', async (req, res) => {
  try {
    const { nftAddress, owner, operator } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, providerChild)
    const isApproval = await childContract.isApprovedForAll(owner, operator)

    res.status(200).json({ status: 'success', isApproval: isApproval })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/approved', async (req, res) => {
  try {
    const { from, nftAddress, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress , KoChild5.abi , providerChild)

    const addressApprove = await childContract.getApproved(tokenId)

    res.status(200).json({ status: 'success', addressApprove: addressApprove })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/encode-metadata', async (req, res) => {
  try {
    const { nftAddress, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, providerChild)
    const encodeMetadata = await childContract.encodeTokenMetadata(tokenId)

    res.status(200).json({ status: 'success', encodeMetadata: encodeMetadata })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
