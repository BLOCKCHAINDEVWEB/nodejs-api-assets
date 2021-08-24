// import IPFSAPI from 'ipfs-api'
import ipfsClient from 'ipfs-http-client'

// const Ipfs = new IPFSAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
const Ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https', repo: 'ipfs-ko' })

export default Ipfs