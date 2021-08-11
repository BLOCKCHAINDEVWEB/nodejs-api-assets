// Check before to continue if the id is an integer
// Using when need to get the id (RUD)
function mustBeInteger(req, res, next) {
  const id = req.params.id

  if (!Number.isInteger(parseInt(id))) {
      res.status(400).json({ message: 'ID must be an integer' })
  } else {
      next()
  }
}

// Check before to continue if data
// Using when need to get the id (CU)
function checkFieldsPost(req, res, next) {
  const { title, item_name, author, description, type, assertURI, properties } = req.body

  if (title && item_name && author && description && type && assertURI && properties) {
      next()
  } else {
      res.status(400).json({ message: 'fields are not good' })
  }
}

// module.exports = {
//   mustBeInteger,
//   checkFieldsPost
// }

export default {
  mustBeInteger,
  checkFieldsPost
}