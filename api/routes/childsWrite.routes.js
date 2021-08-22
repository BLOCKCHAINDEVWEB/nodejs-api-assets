import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import { ethers } from 'ethers'
import * as sigUtil from 'eth-sig-util'
import * as ethUtil from 'ethereumjs-util'
import config from '../../config'
import KoChild4 from '../artifacts4/tokenNFT.json'
import KoChild5 from '../artifacts5/tokenNFT.json'
import { chainId, token, estimateFeeGas, nftContractIsDeploy } from '../controlers/nftsController'

const router = express.Router()
const { name, version } = token
const { chainMumbai } = chainId
const abiCoder = new ethers.utils.AbiCoder()
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// polygon node url
const ERC721Predicate = config.root.posERC721Predicate  // ERC721PredicateProxy
const maticProvider = config.child.RPC
const providerChild = new ethers.providers.JsonRpcProvider(maticProvider)

// Create a wallet instance
const privateKey = process.env.PRIVATE_KEY
const walletChild = new ethers.Wallet(privateKey)
const signerChild = walletChild.connect(providerChild)
// const signer = providerChild.getSigner()

router.post('/mint', async (req, res) => {
  try {
    const { from, metadataCid, nftAddress } = req.body
    const childContract = new ethers.Contract(nftAddress , KoChild5.abi , signerChild)

    // const ipfsMetadata = await axios.get(`https://ipfs.io/ipfs/${metadataCid}`)
    // const URI = `ipfs://${ipfsMetadata.data}`
    const URI = 'ipfs://QmZeYychcKrodnKo72JeSNdimeJ6AukrSNaPmsT2NpzdWE'

    const dataTx = { from, URI }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    // await contract.connect(signer)["mint(address,string)"](await signer.getAddress(), uriNFT);
    const respMint = await childContract.mintable(from, URI, {
      from: from,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    })
    console.log(respMint.hash)
    // const txMint = await respMint.wait()
    // const tokenId = txMint.events[0].args[2].toNumber()
    // console.log(tokenId)

    res.status(200).json({ status: 'success' })
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

router.post('/mint-factory', async (req, res) => {
  try {
    const { from, name, symbol, metadataCid } = req.body
    // const { contractAddress } = await nftContractIsDeploy(name, symbol)
    const contractAddress = '0x4A6f2FC2006616542305e39AbAFE8C27385e8B3c'
    console.log(contractAddress)

    const childContract = new ethers.Contract(contractAddress , KoChild5.abi , signerChild)

    // const ipfsMetadata = await axios.get(`https://ipfs.io/ipfs/${metadataCid}`)
    // const URI = `ipfs://${ipfsMetadata.data}`
    const URI = 'ipfs://QmZeYychcKrodnKo72JeSNdimeJ6AukrSNaPmsT2NpzdWE'
    
    const respMint = await childContract.mintable(from, URI, {
      from: from,
      gasPrice: 50000,
      gasLimit: 50000
    })
    // console.log(respMint.hash)
    const txMint = await respMint.wait()
    const tokenId = txMint.events[0].args[2].toNumber()
    console.log(tokenId)

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

router.post('/exec-metadata', async (req, res) => {
  try {
    const { from, to, nftAddress, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress , KoChild5.abi , signerChild)

    // const msgParams = {
    //   name: name,
    //   version: version,
    //   childAddress: nftAddress,
    //   from: from,
    //   to: to,
    //   tokenId: 1
    // }

    // const { fctSign, r, s, v } = await getTxDataTransfer(childContract, msgParams, privateKey)

    const nonce = Number(await childContract.getNonce(from))
    console.log(nonce)
    // console.log(await providerChild.getBlockNumber())
    // console.log(await providerChild.getTransactionCount(nftAddress))

    const transferFunctionAbi = ["function transferFrom(address from, address to, uint256 tokenId) external"]
    const iTransferFunction = new ethers.utils.Interface(transferFunctionAbi)
    const fctSign = iTransferFunction.encodeFunctionData("transferFrom", [from, to, tokenId])

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32"}
    ]
    const metaTransactionType = [
       { name: "nonce", type: "uint256" },
       { name: "from", type: "address" },
       { name: "fctSign", type: "bytes" }
    ]
    const domainData = {
      name: name,
      version: version,
      verifyingContract: nftAddress,
      salt: '0x'.concat(chainMumbai.toString(16).padStart(64, '0'))
    }
  
    const msgParams = {
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType
      },
      domain: domainData,
      primaryType: "MetaTransaction",
      message: {
        nonce: nonce,
        from: from,
        fctSign: fctSign
      }
    }
    console.log(msgParams)
    const privateKeyBuffer = Buffer.from(privateKey, "hex")
  
    const sig = sigUtil.signTypedData_v4(
      privateKeyBuffer,
      {data: msgParams}
    )

    const { r, s, v } = ethUtil.fromRpcSig(sig)

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
    console.log(tx.hash)

    res.status(200).json({ status: 'success' })
    // res.status(200).json({ status: 'success', txHash: tx.hash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


router.post('/approve', async (req, res) => {
  try {
    const { owner, nftAddress, to, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, signerChild)

    const depositData = abiCoder.encode(['uint256'], [tokenId])

    const dataTx = { ERC721Predicate, depositData }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    const tx = await childContract.approve(ERC721Predicate, tokenId, {
      from: owner,
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
    const { userAddress, nftAddress, predicate, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress, KoChild5.abi, signerChild)

    const depositData = abiCoder.encode(['uint256'], [tokenId])

    const dataTx = { predicate, depositData }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    const tx = await childContract.approve(predicate, tokenId, {
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

router.post('/approval-all', async (req, res) => {
  try {
    const { from, operator, approved } = req.body
    const childContract = new ethers.Contract(operator , KoChild5.abi , signerChild)

    const dataTx = { operator, approved }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    const approve = await childContract.setApprovalForAll(operator, approved, {
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

router.post('/transfer-from', async (req, res) => {
  try {
    const { from, to, nftAddress, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress , KoChild5.abi , signerChild)
    
    const tx = await childContract.transferFrom(from, to, tokenId, {
      from: from
    })
    console.log("NFT transferred:", tx.hash)
    console.log("Tx nonce:", tx.nonce)

    res.status(200).json({ status: 'success', txHash: tx.hash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/safe-transfer-from-1', async (req, res) => {
  try {
    const { from, to, nftAddress, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress , KoChild5.abi , signerChild)

    const dataTx = { from, to, tokenId }
    const { gasPrice, gasLimit } = await estimateFeeGas(providerChild, dataTx)

    const tx = await childContract["safeTransferFrom(address,address,uint256)"](from, to, tokenId, {
      from,
      gasPrice: 50000,
      gasLimit: 50000
    })
    console.log(tx)

    res.status(200).json({ status: 'success' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/burn', async (req, res) => {
  try {
    const { from, nftAddress, tokenId } = req.body
    const childContract = new ethers.Contract(nftAddress , KoChild5.abi , signerChild)

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
