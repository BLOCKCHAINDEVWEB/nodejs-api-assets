import express from 'express'
import posts from './routes/posts.routes'
import ipfs from './routes/ipfs.routes'
import childs from './routes/childs.routes'
import roots from './routes/roots.routes'

const router = express.Router()

router.use('/posts', posts)
router.use('/ipfs', ipfs)
router.use('/child', childs)
router.use('/root', roots)

export default router
