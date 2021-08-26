import fs from 'fs'
import express from 'express'
import pinata from '../services/pinata'
import Ipfs from '../services/ipfs'
import { ReadableStream } from 'node-web-streams'

const router = express.Router()

// source: https://github.com/PinataCloud/Pinata-SDK#pinJSONToIPFS-anchor
router.post('/pinFilePinata', async (req, res) => {
  try {
    const { file } = req.body
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

// may take a while to load as public gateways can be very slow
router.post('/ipfsText', async (req, res) => {
  try {
    const addFile = async (text) => {
      const file = { path: 'testfile', content: Buffer.from(text)}
      const { path, cid, size } = await Ipfs.add(file)
      return { path, cid, size }
    }

    const createFiles = async (directory) => {
      // const json = JSON.stringify({ content: 'Loreum ipsum' })
      // const fileHash = await addFile(json)
      // console.log(fileHash.cid)
      return [{
        path: `${directory}/file1.txt`,
        // content could be a stream, a url, a Uint8Array, a File etc
        content: `one`
      }, {
        path: `${directory}/file2.txt`,
        content: 'two'
      }, {
        path: `${directory}/file3.txt`,
        content: 'tree'
      }]
    }
    
    const streamFiles = async (ipfs, directory, files) => {
      // Create a stream to write files to
      const stream = new ReadableStream({
        start(controller) {
          files.map((file, i) => {
            controller.enqueue(files[i])
          })
          controller.close()
        }
      })
    
      const data = await ipfs.add(stream)
      console.log(data)
      console.log(`Added ${data.path} hash: ${data.cid}`)
      // The last data event will contain the directory hash
      if (data.path === directory) return data.cid
    }

    const directoryName = 'directory'
    const files = await createFiles(directoryName)
    const directoryHash = await streamFiles(Ipfs, directoryName, files)
    console.log(`${directoryName}/ ${directoryHash}`)

    res.status(200).json({ success: 'success' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

export default router