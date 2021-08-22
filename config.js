import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

export default {
  // POSContracts: test5KO
  root: {
    RPC: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    POSRootChainManager: "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74",  // RootChainManagerProxy
    DERC721: "0xcfef4df2832455630F521e6765F8362bF11Fe2BA",  // tokens address deploy
    posERC721Predicate: "0x74D83801586E9D3C4dc45FfCD30B54eA9C88cf9b",   // ERC721PredicateProxy (maticSDK)
    posMintableERC721Predicate: "0x56E14C4C1748a818a5564D33cF774c59EB3eDF59",  // MintableERC721PredicateProxy
  },
  child: {
    RPC: "https://rpc-mumbai.maticvigil.com/v1/339bfd1060db13f0f39cac79e2cca45b637c93e9",
    DERC721: "0xC13bF24Cc00564fA00C7161ea4DCCDd4E00e1d1C",  // tokens address deploy
  },
}

// POSContracts: test6KO
// root: {
//   DERC721: "0x8F24F733790f77849d8023aAd8737F8495C395A4",  // tokens address deploy
// },
// child: {
//   DERC721: "0x7573713f12ffD765dfFd1F1D44Abc5D90A121810",  // tokens address deploy
// },

// "childChainManager": "0xb5505a6d998549090530911180f38aC5130101c6"