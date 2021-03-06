import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import express from 'express'
import axios from 'axios'
import requestImageSize from 'request-image-size'
import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'
import pinata from '../services/pinata'

const router = express.Router()
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
const env = process.env.NODE_ENV || 'development'

// need nodejs server host for production
if (env !== 'production') {
  router.post('/userDatasJPG', async (req, res) => {
    try{
      const { from, upload, name, symbol, description } = req.body
      if (name === '' || symbol === '') return
  
      const { height, width, type } = await requestImageSize(upload)
      console.log({ type: type, width: width, height: height })
  
      const fileName = upload.split('/').pop()
      const fileType = fileName.split('.').pop()
  
      const pathImg = '../assets/img'
      const pathFileName = path.join(__dirname, `${pathImg}/${fileName}`)
      const readableStreamForFile = fs.createReadStream(pathFileName)
  
      // awaiting response from pinata
      // require realized fallback decentralized / centralized for public version
      const hashImg = await pinata.pinFileToIPFS(readableStreamForFile, {
        pinataMetadata: {
          name: 'Filename',
        }
      })
      console.log(hashImg) // QmTjV2jUubonFoPZBQU6Yy8wcgxvwHWqZe7efAMzDcW4Hv
  
      const metadata = {
        title: 'title',
        item_name: 'item_name',
        author: 'author',
        type: 'jpg',
        description: description,
        assertURI: `ipfs://${hashImg.IpfsHash}`,
        properties: {
          width: width,
          height: height
        }
      }
    
      // awaiting response from pinata
      // require realized fallback decentralized / centralized for public version
      const hashJSON = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: 'Filename',
        }
      })
      console.log(hashJSON.IpfsHash) // QmZeYychcKrodnKo72JeSNdimeJ6AukrSNaPmsT2NpzdWE
  
      const updateMetadata = async metadata => {
        try {
          const id = 1
          const url = `./api/posts/${id}`
          const result = await axios({
            method: 'PUT',
            url: url,
            data: metadata,
            headers: { 'Content-Type': 'application/json' }
          })
          const msg = (result.statusText === 'OK')
            ? { status: 'success' }
            : { satus: 'fail' }
          return { msg }
        } catch (err) {
          console.log(err)
        }
      }
      const { msg } = await updateMetadata(metadata)
  
      res.status(200).json({
        status: 'success',
        nftAddress: contractAddress,
        hash: hashJSON.IpfsHash,
        update: msg
      })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  
  // need nodejs server host
  router.post('/userDatasMP4', async (req, res) => {
    try {
      const { from, upload, name, symbol } = req.body
      if (name === '' || symbol === '') return
  
      const fileName = upload.split('/').pop()
      const pathVideo = '../assets/video'
      const pathFileName = path.join(__dirname, `${pathVideo}/${fileName}`)
      const readableStreamForFile = fs.createReadStream(pathFileName)
  
      // awaiting response from pinata
      // require realized fallback decentralized / centralized for public version
      const hashVideo = await pinata.pinFileToIPFS(readableStreamForFile, {
        pinataMetadata: {
          name: 'Filename',
        }
      })
      console.log('hashVideo:', hashVideo) // QmVzmsRo6avD1HeBWY3WTUGdqvhya4KK999k77nFZS7i2S
  
      await ffprobe(upload, { path: ffprobeStatic.path }, async (err, info) => {
        const width = info.streams[0].width
        const height = info.streams[0].height
        const duration = Math.floor(info.streams[1].duration)
        console.log({ duration: duration, width: width, height: height })
      })
  
      res.status(200).json({ status: 'success', hash: hashJSON.IpfsHash })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
}

export default router
