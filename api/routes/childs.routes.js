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
// import KoChild from '../artifacts/tokenNFT.json'
import KoChild from '../artifacts/KoChildMintableERC721.json'
import { token, getTxDataTransfer, estimateFeeGas, nftContractIsDeploy } from '../controlers/nftsController'

const router = express.Router()
const { name, version } = token
dotenv.config({ path: path.join(__dirname, '../../.env') })

// polygon node url
const nftChild = '0x3E436530Ba524694a1657AF26bab51839F34f738'
const privateKey = process.env.PRIVATE_KEY
const maticProvider = 'https://rpc-mumbai.maticvigil.com/v1/339bfd1060db13f0f39cac79e2cca45b637c93e9'
const providerChild = new ethers.providers.JsonRpcProvider(maticProvider)

const walletChild = new ethers.Wallet(privateKey)
const signerChild = walletChild.connect(providerChild)
const childContract = new ethers.Contract(nftChild , KoChild.abi , signerChild)

router.post('/userDatas', async (req, res) => {
  const { from, upload, name, symbol, description } = req.body

  if (name === '' || symbol === '') return
  // const { contractAddress } = await nftContractIsDeploy(name, symbol)
  // const contractAddress = '0x4A6f2FC2006616542305e39AbAFE8C27385e8B3c'
  // console.log(contractAddress)
  const { height, width, type } = await requestImageSize(upload)

  // const fileName = upload.split('/').pop()
  // const fileType = fileName.split('.').pop()

  // let pathImg
  // switch (fileType) {
  //   case 'jpg':
  //     pathImg = '../assets/img'
  //     break
  //   case 'mp4':
  //     pathImg = '../assets/video'
  //     break
  //   default:
  //   break
  // }

  // const pathFileName = path.join(__dirname, `${pathImg}/${fileName}`)
  // const readableStreamForFile = fs.createReadStream(pathFileName)

  // awaiting response from pinata
  // require realized fallback decentralized / centralized for public version
  // const hashImg = await pinata.pinFileToIPFS(readableStreamForFile, {
  //   pinataMetadata: {
  //     name: 'Filename',
  //   }
  // })
  // console.log(hashImg) // QmTjV2jUubonFoPZBQU6Yy8wcgxvwHWqZe7efAMzDcW4Hv

  // const metadata = {
  //   title: '',
  //   item_name: '',
  //   author: '',
  //   type: '',
  //   description: description,
  //   assertURI: `ipfs://${hashImg.IpfsHash}`,
  //   properties: {
  //     width: '',
  //     height: ''
  //   }
  // }
 
  // awaiting response from pinata
  // require realized fallback decentralized / centralized for public version
  // const hashJSON = await pinata.pinJSONToIPFS(metadata, {
  //   pinataMetadata: {
  //     name: 'Filename',
  //   }
  // })
  // console.log(hashJSON.IpfsHash) // QmZeYychcKrodnKo72JeSNdimeJ6AukrSNaPmsT2NpzdWE

  // console.log(metadata)
  
  // try {
  //   const id = 1
  //   const url = `http://localhost:3000/api/posts/${id}`
  //   const res = await axios({
  //     method: 'PUT',
  //     url: url,
  //     data: metadata
  //   })
  //   console.log(res)
  // } catch (err) {
  //   console.log(err)
  // }
  // return { nftAddress: contractAddress, hash: hashJSON.IpfsHash }
})

router.post('/mint', async (req, res) => {
  try {
    const { from, metadataUri, nftAddress } = req.body

    const ipfsMetadata = await axios.get(`https://ipfs.io/ipfs/${metadataUri}`)
    const URI = ipfsMetadata.data
    
    const childNftContract = new ethers.Contract(nftAddress , KoChild.abi , signerChild)
    const dataTx = { from, URI }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    // await contract.connect(signer)["mint(address,string)"](await signer.getAddress(), uriNFT);
    
    const respMint = await childNftContract.mint(from, URI, {
      from: from,
      // gasPrice: gasPrice,
      // gasLimit: gasLimit
    })
    const txMint = await respMint.wait()
    console.log(txMint) // transaction failed
    // const tokenId = txChild.events[0].args[2].toNumber()
    // console.log(tokenId)

    res.status(200).json({ status: 'success'})
    // res.status(200).json({
    //   status: 'success',
    //   nftContract: nftContract.address,
    //   txHash: txChild.transactionHash,
    //   tokenId: tokenId
    // })
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