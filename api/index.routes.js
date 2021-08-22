import express from 'express'
import posts from './routes/posts.routes'
import ipfs from './routes/ipfs.routes'
import childs from './routes/childs.routes'
import childsRead from './routes/childsRead.routes'
import childsWrite from './routes/childsWrite.routes'
import rootsWrite from './routes/rootsWrite.routes'
import rootsRead from './routes/rootsRead.routes'
import rootsChain from './routes/rootsChain.routes'

const router = express.Router()

router.use('/posts', posts)
router.use('/ipfs', ipfs)
router.use('/child', childs)
router.use('/child', childsRead)
router.use('/child', childsWrite)
router.use('/root', rootsWrite)
router.use('/root', rootsRead)
router.use('/root', rootsChain)

export default router
