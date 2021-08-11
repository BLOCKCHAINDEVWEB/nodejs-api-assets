// const express = require('express');
import express from 'express'
import posts from './routes/posts.routes'

const router = express.Router();

router.use('/api/posts', posts);

// module.exports = router;
export default router
