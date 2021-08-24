import express from 'express'
import posts from './routes/posts.routes'
import ipfs from './routes/ipfs.routes'
import users from './routes/users.routes'

const router = express.Router()

router.use('/posts', posts)
router.use('/ipfs', ipfs)
router.use('/users', users)

export default router
