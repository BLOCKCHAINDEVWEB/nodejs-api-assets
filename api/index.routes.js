const express = require('express');
const router = express.Router();

router.use('/api/posts', require('./routes/posts.routes'));

module.exports = router;