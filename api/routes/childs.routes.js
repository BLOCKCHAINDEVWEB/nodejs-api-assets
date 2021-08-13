import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import express from 'express'
import { ethers } from 'ethers'
import axios from 'axios'
import requestImageSize from 'request-image-size'
import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'
import pinata from '../services/pinata'
import KoChildAbi from '../artifacts/tokenNFT.json'
import nftChildAbi from '../artifacts/ChildMintableERC721.json'
import { token, getTxDataTransfer, estimateFeeGas } from '../controlers/nftsController'

const router = express.Router()
const { name, version } = token
dotenv.config({ path: path.join(__dirname, '../../.env') })

// polygon node url
const nftChild = '0x3E436530Ba524694a1657AF26bab51839F34f738'
const childChainManager = '0xb5505a6d998549090530911180f38aC5130101c6'
const privateKey = process.env.PRIVATE_KEY
const maticProvider = 'https://rpc-mumbai.maticvigil.com/v1/339bfd1060db13f0f39cac79e2cca45b637c93e9'
const providerChild = new ethers.providers.JsonRpcProvider(maticProvider)

const walletChild = new ethers.Wallet(privateKey)
const signerChild = walletChild.connect(providerChild)
const childContract = new ethers.Contract(nftChild , KoChildAbi , signerChild)

router.post('/mint', async (req, res) => {
  try {
    const { from, upload, name, symbol, description } = req.body

    if (name === '' || symbol === '') return
    // const { status, nftContract, txHash } = await nftContractIsDeploy(name, symbol)
    const nftContract = '0x95AA0cFF2dd1fAC229C955227016b5D66766F84a'
    const { height, width, type } = await requestImageSize(upload)

    const fileName = upload.split('/').pop()
    const fileType = fileName.split('.').pop()

    let pathImg
    switch (fileType) {
      case 'jpg':
        pathImg = '../assets/img'
        break
      case 'mp4':
        pathImg = '../assets/video'
        break
      default:
      break
    }

    const pathFileName = path.join(__dirname, `${pathImg}/${fileName}`)
    const readableStreamForFile = fs.createReadStream(pathFileName)

    // awaiting response from pinata
    // require realized fallback decentralized / centralized for public version
    const hashImg = await pinata.pinFileToIPFS(readableStreamForFile, {
      pinataMetadata: {
        name: 'Filename',
      }
    })
    // console.log(hashImg) // QmTjV2jUubonFoPZBQU6Yy8wcgxvwHWqZe7efAMzDcW4Hv

    const dataUser = {
      title: '',
      item_name: '',
      author: '',
      description: ''
    }
    const metadataUpdate = (dataUser, hashImg, height, width, type) => {
      const metadata = {
        ...dataUser,
        type,
        assertURI: `ipfs://${hashImg.IpfsHash}`,
        properties: {
          width,
          height
        }
      }
      return { metadata }
    }
    const { metadata } = await metadataUpdate(dataUser, hashImg, height, width, type)

    // awaiting response from pinata
    // require realized fallback decentralized / centralized for public version
    const hashJSON = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: 'Filename',
      }
    })
    // console.log(hashJSON.IpfsHash) // QmZeYychcKrodnKo72JeSNdimeJ6AukrSNaPmsT2NpzdWE
 
    // const params = 1
    // await axios({
    //   method: 'PUT',
    //   url: `http://localhost:3000/api/posts/${params}`,
    //   data: metadata
    // })

    const ipfsMetadata = await axios.get(`https://ipfs.io/ipfs/${hashJSON.IpfsHash}`)
    const URI = ipfsMetadata.data
    const respChild = await childContract.mintable(from, URI)
    const txChild = await respChild.wait()
    // console.log(txChild)
    const tokenId = txChild.events[0].args[2].toNumber()
    console.log(tokenId)

    const childNftContract = new ethers.Contract(nftContract , nftChildAbi.abi , signerChild)

    const dataTx = { from, tokenId }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    const respMint = await childNftContract.mint(from, tokenId, {
      from: from,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    const txMint = await respMint.wait()
    console.log(txMint) // transaction failed

    res.status(200).json({ status: 'success'})
    // res.status(200).json({ status: 'success', nftContract: nftContract.address, txHash: result.transactionHash })
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

// router.post('/deposit', async (req, res) => {
//   try {
//     const { from, user, depositData } = req.body
//     const tx = await childContract.deposit(user, depositData, {
//       from: from
//     })
//     console.log(tx)

//     res.status(200).json({ status: 'success' })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// })

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