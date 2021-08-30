import fs from 'fs'
import path from 'path'
import { Buffer } from 'buffer'
import express from 'express'
import fetch from 'node-fetch'
import pinata from '../services/pinata'
import Ipfs from '../services/ipfs'
import { ReadableStream } from 'node-web-streams'
import { waitForDebugger } from 'inspector'

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

// may take a while to load as public gateways can be slow
router.post('/ipfsText', async (req, res) => {
  try {
    const { filesURL } = req.body
    const addFile = async text => {
      const file = { path: 'testfile', content: Buffer.from(text)}
      const { path, cid, size } = await Ipfs.add(file)
      return { path, cid, size }
    }
    const url1 = filesURL[0].url1
    const url2 = filesURL[1].url2
    const url3 = filesURL[2].url3

    const fileName1 = url1.split('/').pop()
    const fileName2 = url2.split('/').pop()
    const fileName3 = url3.split('/').pop()

    const contentFile1 = await (await fetch(`${url1}`)).text()
    const contentFile2 = await (await fetch(`${url2}`)).text()
    const contentFile3 = JSON.stringify(await (await fetch(`${url3}`)).json())

    const createFiles = async (directory) => {
      const json = JSON.stringify({ content: 'Loreum ipsum' })
      const fileHashJson = await addFile(json)

      return [{
        path: `${directory}/${fileName1}`,
        // content could be a stream, a url, a Uint8Array, a File etc
        content: `${contentFile1}`
      }, {
        path: `${directory}/${fileName2}`,
        content: `${contentFile2}`
      }, {
        path: `${directory}/${fileName3}`,
        content: `${contentFile3}`
      }, {
        path: `${directory}/${fileHashJson.cid}`,
        content: `${json}`
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
      console.log(`Added ${data.path} hash: ${data.cid}`) // QmYT6vscRR76WMZds7WhStPPMnT7tHncunanjhBUKgfNYm
      // The last data event will contain the directory hash
      if (data.path === directory) return data.cid
    }

    const directoryName = 'directory'
    const files = await createFiles(directoryName)
    const directoryHash = await streamFiles(Ipfs, directoryName, files)
    console.log(`${directoryName}/ ${directoryHash}`)  // directory/ QmYT6vscRR76WMZds7WhStPPMnT7tHncunanjhBUKgfNYm

    res.status(200).json({ success: 'success' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

router.post('/ipfsMedia', async (req, res) => {
  try {
    const { filesURL } = req.body
    const url1 = filesURL[0].url1
    const url2 = filesURL[1].url2
    const url3 = filesURL[2].url3

    const fileName1 = url1.split('/').pop()
    const fileName2 = url2.split('/').pop()
    const fileName3 = url3.split('/').pop()

    const blobUrl1 = await (await fetch(`${url1}`)).blob()
    const blobUrl2 = await (await fetch(`${url2}`)).blob()
    const blobUrl3 = await (await fetch(`${url3}`)).blob()

    // Bonus
    const addImg = async blob => {
      const bufferImg = await blob.arrayBuffer()
      const { path, cid, size } = await Ipfs.add(bufferImg)
      const pathImg = path
      const cidImg = cid
      const sizeImg = size
      return { bufferImg, pathImg, cidImg, sizeImg }
    }
    const addMusic = async blob => {
      const bufferMusic = await blob.arrayBuffer()
      const { path, cid, size } = await Ipfs.add(bufferMusic)
      const pathMusic = path
      const cidMusic = cid
      const sizeMusic = size
      return { bufferMusic, pathMusic, cidMusic, sizeMusic }
    }
    const addVideo = async blob => {
      const bufferVideo = await blob.arrayBuffer()
      const { path, cid, size } = await Ipfs.add(bufferVideo)
      const pathVideo = path
      const cidVideo = cid
      const sizeVideo = size
      return { bufferVideo, pathVideo, cidVideo, sizeVideo }
    }
    const { cidImg } = await addImg(blobUrl1)
    const { cidMusic } = await addMusic(blobUrl2)
    const { cidVideo } = await addVideo(blobUrl3)

    // create Directory
    const createFiles = async (directory) => {
      return [{
        path: `${directory}/${fileName1}`,
        content: await blobUrl1.arrayBuffer()
      }, {
        path: `${directory}/${fileName2}`,
        content: await blobUrl2.arrayBuffer()
      }, {
        path: `${directory}/${fileName3}`,
        content: await blobUrl3.arrayBuffer()
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
      console.log(`Added ${data.path} hash: ${data.cid}`) // QmVv6EQnSFnxrjYahqHuzLpNTG5y2cqG7bgeQRrup8QuRe
      // The last data event will contain the directory hash
      if (data.path === directory) return data.cid
    }

    const directoryName = 'directory'
    const files = await createFiles(directoryName)
    const directoryHash = await streamFiles(Ipfs, directoryName, files)
    console.log(`${directoryName}/ ${directoryHash}`)  // directory/ QmVv6EQnSFnxrjYahqHuzLpNTG5y2cqG7bgeQRrup8QuRe
  
    res.status(200).json({ success: 'success' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

router.post('/ipfsRead', async (req, res) => {
  try {
    const { directoryHash, file } = req.body

    for await (const item of Ipfs.cat(`${directoryHash}/${file}`)) {
      console.log(item.toString())
    }

    res.status(200).json({ success: 'success' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

router.post('/ipfsDemo', async (req, res) => {
  try {
    const { filesURL } = req.body
    const addFile = async text => {
      const file = { path: 'testfile', content: Buffer.from(text)}
      const { path, cid, size } = await Ipfs.add(file)
      return { path, cid, size }
    }
    const url1 = filesURL[0].url1
    const url2 = filesURL[1].url2
    const url3 = filesURL[2].url3
    const url4 = filesURL[3].url4
    const url5 = filesURL[4].url5
    const url6 = filesURL[5].url6

    const fileName1 = url1.split('/').pop()
    const fileName2 = url2.split('/').pop()
    const fileName3 = url3.split('/').pop()
    const fileName4 = url4.split('/').pop()
    const fileName5 = url5.split('/').pop()
    const fileName6 = url6.split('/').pop()

    const contentFile1 = await (await fetch(`${url1}`)).text()
    const contentFile2 = await (await fetch(`${url2}`)).text()
    const contentFile3 = JSON.stringify(await (await fetch(`${url3}`)).json())
    const blobUrl1 = await (await fetch(`${url4}`)).blob()
    const blobUrl2 = await (await fetch(`${url5}`)).blob()
    const blobUrl3 = await (await fetch(`${url6}`)).blob()

    const createFiles = async (directory) => {
      const json = JSON.stringify({ content: 'Loreum ipsum' })
      const fileHashJson = await addFile(json)

      return [{
        path: `${directory}/${fileName1}`,
        // content could be a stream, a url, a Uint8Array, a File etc
        content: `${contentFile1}`
      }, {
        path: `${directory}/${fileName2}`,
        content: `${contentFile2}`
      }, {
        path: `${directory}/${fileName3}`,
        content: `${contentFile3}`
      }, {
        path: `${directory}/${fileHashJson.cid}`,
        content: `${json}`
      }, {
        path: `${directory}/${fileName4}`,
        content: await blobUrl1.arrayBuffer()
      }, {
        path: `${directory}/${fileName5}`,
        content: await blobUrl2.arrayBuffer()
      }, {
        path: `${directory}/${fileName6}`,
        content: await blobUrl3.arrayBuffer()
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
      console.log(`Added ${data.path} hash: ${data.cid}`) // QmcYQStiHy2UJZg4AdDPuX1RuMh7zuaLmLkgRRXDMWk7eT
      // The last data event will contain the directory hash
      if (data.path === directory) return data.cid
    }

    const directoryName = 'directory'
    const files = await createFiles(directoryName)
    const directoryHash = await streamFiles(Ipfs, directoryName, files)
    console.log(`${directoryName}/ ${directoryHash}`)  // directory/ QmcYQStiHy2UJZg4AdDPuX1RuMh7zuaLmLkgRRXDMWk7eT

    res.status(200).json({ success: 'success' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

export default router