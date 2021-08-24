import express from 'express'
import post from '../models/posts.model'
import m from '../helpers/middlewares'

const router = express.Router()

/* All posts */
router.get('/', async (req, res) => {
    await post.getPosts()
    .then(posts => res.json(posts))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            return res.status(500).json({ message: err.message })
        }
    })
})

/* A post by id */
router.get('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id

    await post.getPost(id)
    .then(post => res.json(post))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
          return res.status(500).json({ message: err.message })
        }
    })
})

/* Insert a new post */
router.post('/', m.checkFieldsPost, async (req, res) => {
    await post.insertPost(req.body)
    .then(post => res.status(201).json({
        message: `The post #${post.id} has been created`,
        content: post
    }))
    .catch(err => res.status(500).json({ message: err.message }))
})

/* Update a post */
router.put('/:id', m.mustBeInteger, m.checkFieldsPost, async (req, res) => {
    const id = req.params.id

    await post.updatePost(id, req.body)
    .then(post => res.json({
        message: `The post #${id} has been updated`,
        content: post
    }))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        }
        return res.status(500).json({ message: err.message })
    })
})

/* Delete a post */
router.delete('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id

    await post.deletePost(id)
    .then(post => res.json({
        message: `The post #${id} has been deleted`
    }))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        }
        res.status(500).json({ message: err.message })
    })
})

export default router
