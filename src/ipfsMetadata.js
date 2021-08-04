import path from 'path'
import fs from 'fs'
import IPFSAPI from 'ipfs-api'
import axios from 'axios'
import requestImageSize from 'request-image-size'
import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'

const ipfs = new IPFSAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

const execute = async () => {
  const CID = 'QmaQNPLWTSKNXCvzURSi3WrkywJ1qcnYC56Dw1XMrxYZ7Z'
  const result = await ipfs.files.get(CID)
  result.forEach(file => {
    console.log(file.path)
    console.log(file.content.toString('utf8'))
  })

  const metadata = {
    title: '',
    item_name: '',
    author: '',
    description: '',
    type: '',
    assertURI: '',
    properties: {
      width: '',
      height: '',
      duration: '',
      supply: ''
    }
  }

  const downloadFile = async (fileUrl, downloadFolder) => {
    // Get the file name
    const fileName = path.basename(fileUrl);
  
    // The path of the downloaded file on our machine
    const localFilePath = path.resolve(__dirname, downloadFolder, fileName);
    try {
      const resp = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
      });

      if (fileName.split('.').pop() === 'jpg') {
        const reqImg = await requestImageSize(fileUrl)
        console.log(reqImg)
      } else if (fileName.split('.').pop() === 'mp4') {
        await ffprobe(fileUrl, { path: ffprobeStatic.path }, (err, info) => {
          if (err) return done(err);
          // console.log(info)
          console.log(info.streams[0].width)
          console.log(info.streams[0].height)
          console.log(Math.floor(info.streams[1].duration))
        })
      }

      const w = resp.data.pipe(fs.createWriteStream(localFilePath));
      w.on('finish', () => {
        console.log('Successfully downloaded file!');
      });

    } catch (err) {
      throw new Error(err);
    }
  }; 

  const urlImg = 'http://localhost:3000/img/Orientation_512x512.jpg'
  downloadFile(urlImg, 'download')

  const urlVideo = 'http://localhost:3000/video/bigbuck.mp4'
  downloadFile(urlVideo, 'download')


}
execute()
