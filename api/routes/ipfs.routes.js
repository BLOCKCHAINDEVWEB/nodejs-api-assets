import fs from 'fs'
import express from 'express'
import pinata from '../services/pinata'

const router = express.Router()

// source: https://github.com/PinataCloud/Pinata-SDK#pinJSONToIPFS-anchor
router.post('/pinFilePinata', async (req, res) => {
  try {
    // const file = req.body.file
    const file = '../nodejs-api-assets/queries/inputs/Orientation_512x512.jpg'
    const readableStreamForFile = fs.createReadStream(file)
    const options = {
      pinataMetadata: {
        name: 'Filename',
      }
    }
    const result = await pinata.pinFileToIPFS(readableStreamForFile, options)
    console.log(result) // QmTjV2jUubonFoPZBQU6Yy8wcgxvwHWqZe7efAMzDcW4Hv

    res.status(200).json({ success: 'success', result: result.IpfsHash })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})
router.post('/pinJsonPinata', async (req, res) => {
  try {
    const json = req.body
    const options = {
      pinataMetadata: {
        name: 'Filename',
      }
    }
    const result = await pinata.pinJSONToIPFS(json, options)
    console.log(result) // QmTrsnkq1NS5o8AGw3LVzWMFH54ynW4JvR9JSzdiB7rHDY

    res.status(200).json({ success: 'success', result: result.IpfsHash })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

router.post('/pinHashPinata', async (req, res) => {
  try {
    const { hashToPin } = req.body
    const options = {
      pinataMetadata: {
        name: 'Filename',
      }
    }
    const result = await pinata.pinByHash(hashToPin, options)
    console.log(result)

    res.status(200).json({ success: 'success', result: result.IpfsHash })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

export default router