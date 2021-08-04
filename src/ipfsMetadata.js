import path from 'path'
import fs from 'fs'
import IPFSAPI from 'ipfs-api'
import axios from 'axios'
import requestImageSize from 'request-image-size'
import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'

const ipfs = new IPFSAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

const execute = async () => {
  const downloadFile = async (datas, downloadFolder) => {
    const params = datas.id
    // const fileUrl = 'http://localhost:3000/video/bigbuck.mp4'
    const fileUrl = datas.assertURI
    const fileName = path.basename(fileUrl);
    // The path of the downloaded file on our machine
    const localFilePath = path.resolve(__dirname, downloadFolder, fileName)

    try {
      const resp = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
      })
      let newInfos
  
      const update = async (params, newInfos) => {
        await axios({
          method: 'PUT',
          url: `http://localhost:3000/api/posts/${params}`,
          data: newInfos
        })
      }

      if (fileName.split('.').pop() === 'jpg') {
        const { height, width, type } = await requestImageSize(fileUrl)

        newInfos = {
          title: datas.title,
          item_name: datas.item_name,
          author: datas.author,
          description: datas.description,
          type,
          assertURI: fileUrl,
          properties: {
            width,
            height
          }
        }

        await update(params, newInfos)

      } else if (fileName.split('.').pop() === 'mp4') {
        await ffprobe(fileUrl, { path: ffprobeStatic.path }, async (err, info) => {
          if (err) return done(err);

          newInfos = {
            title: datas.title,
            item_name: datas.item_name,
            author: datas.author,
            description: datas.description,
            type,
            properties: {
              width: info.streams[0].width,
              height: info.streams[0].height,
              duration: Math.floor(info.streams[1].duration)
            }
          }

          await update(params, newInfos)
        })
      }

      const w = resp.data.pipe(fs.createWriteStream(localFilePath));
      w.on('finish', () => {
        console.log('Successfully downloaded file!');
      });

    } catch (err) {
      throw new Error(err);
    }
  }

  const getPostId = async params => {
    const { data } = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/posts/${params}`,
      responseType: 'json',
    });
    return data
  }

  const datas = await getPostId(1)
  await downloadFile(datas, 'download')

  // to following

  const CID = 'QmaQNPLWTSKNXCvzURSi3WrkywJ1qcnYC56Dw1XMrxYZ7Z'
  const result = await ipfs.files.get(CID)
  result.forEach(file => {
    console.log(file.path)
    console.log(file.content.toString('utf8'))
  })

}
execute()
