import ipfsClient from 'ipfs-http-client'

const Ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https', repo: 'ipfs-ko' })

export default Ipfs