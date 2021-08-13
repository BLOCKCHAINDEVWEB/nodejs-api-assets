import { ethers } from 'ethers'
import * as sigUtil from 'eth-sig-util'
import * as ethUtil from 'ethereumjs-util'


export const chainId = {
  chainMumbai: 80001,
  chainMainet: 137
}

export const token = {
  name: 'Ko Digital Collectible',
  symbol: 'KODC',
  version: 1
}

export const getEIP712Type = ({ name, version,verifyingContract, salt, nonce, from, functionSignature }) => {
  return {
    types: {
      EIP712Domain: [{
        name: 'name',
        type: 'string'
      }, {
        name: 'version',
        type: 'string'
      }, {
        name: 'verifyingContract',
        type: 'address'
      }, {
        name: 'salt',
        type: 'bytes32'
      }],
      MetaTransaction: [{
        name: 'nonce',
        type: 'uint256'
      }, {
        name: 'from',
        type: 'address'
      }, {
        name: 'functionSignature',
        type: 'bytes'
      }]
    },
    domain: {
      name,
      version,
      verifyingContract,
      salt
    },
    primaryType: 'MetaTransaction',
    message: {
      nonce,
      from,
      functionSignature
    }
  }
}

export const estimateFeeGas = async (provider, dataTx) => {
  const estimateGasBN = await provider.estimateGas(dataTx)
  const gasLimit = Number(estimateGasBN)
  const gasPrice = Number(await provider.getGasPrice())
  const maxFeeGas = await provider.getFeeData()
  const maxFeePerGas= Number(maxFeeGas.maxFeePerGas)
  const maxPriorityFeePerGas = Number(maxFeeGas.maxPriorityFeePerGas)
  const estimateGas = Number(estimateGasBN)
  return { estimateGas, gasPrice, gasLimit, maxFeePerGas, maxPriorityFeePerGas }
}

export const fctSignTransfertFrom = (from, to, tokenId) => {
  const transferFunctionAbi = ["function transferFrom(address from, address to, uint256 tokenId)"]
  const iTransferFunction = new ethers.utils.Interface(transferFunctionAbi)
  const fctSign = iTransferFunction.encodeFunctionData("transferFrom", [from, to, tokenId])
  return fctSign
}

export const getTxDataTransfer = async (contract, datas, privateKey) => {
  const { chainMumbai } = chainId
  const { name, version, childAddress, from, to, tokenId } = datas
  const nonce = Number(await contract.getNonce(from))
  const fctSign = fctSignTransfertFrom(from, to, tokenId)

  const msgParams = getEIP712Type({
    name: name,
    version: version,
    verifyingContract: childAddress,
    salt: '0x'.concat(chainMumbai.toString(16).padStart(64, '0')),
    nonce: nonce,
    from: from,
    functionSignature: fctSign
  })

  const privateKeyBuffer = Buffer.from(privateKey, "hex")

  const sig = sigUtil.signTypedData_v4(
    privateKeyBuffer,
    {data: msgParams}
  )

  const { r, s, v } = ethUtil.fromRpcSig(sig)
  return { fctSign, r, s, v }
}

export const fctSignDeposit = (from, depositData) => {
  const depositFunctionAbi = ["function deposit(address user, bytes calldata depositData)"]
  const interfaceDepositFunction = new ethers.utils.Interface(depositFunctionAbi)
  const fctSign = interfaceDepositFunction.encodeFunctionData("deposit", [ from, depositData ])
  return fctSign
}

export const getTxDataDeposit = async datas => {
  const { chainMumbai } = chainId
  const { name, version, childAddress, from, depositData } = datas

  const nonce = await contract.getNonce(from)
  const fctSign = fctSignDeposit(from, depositData)

  const msgParams = getEIP712Type({
    name: name,
    version: version,
    verifyingContract: childAddress,
    salt: '0x'.concat(chainMumbai.toString(16).padStart(64, '0')),
    nonce: nonce,
    from: from,
    functionSignature: fctSign
  })

  const privateKeyBuffer = Buffer.from(privateKey, "hex")
  const sig = sigUtil.signTypedData_v4(
    privateKeyBuffer,
    { data: JSON.stringify(msgParams) }
  )

  const { r, s, v } = ethUtil.fromRpcSig(sig)
  return { fctSign, r, s, v }
}


export const nftContractIsDeploy = async (name, symbol) => {
  try {
    // The factory we use for deploying contracts
    const factory = new ethers.ContractFactory(nftContratFactory.abi, nftContratFactory.bytecode, signerChild)
    // Deploy an instance of the contract
    const nftContract = await factory.deploy(name, symbol, childChainManager)
    // The transaction that the signer sent to deploy
    await nftContract.deployTransaction
    // Wait until the transaction is mined (i.e. contract is deployed)
    const result = await nftContract.deployTransaction.wait()

    res.status(200).json({ status: 'success', nftContract: nftContract.address, txHash: result.transactionHash })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}