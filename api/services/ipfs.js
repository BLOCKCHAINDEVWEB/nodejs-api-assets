import IPFSAPI from 'ipfs-api'

const ipfs = new IPFSAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

export default ipfs