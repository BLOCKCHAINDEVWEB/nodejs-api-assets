import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import requestImageSize from 'request-image-size'
import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'
import pinata from '../services/pinata'
import ipfs from '../services/ipfs'
dotenv.config({ path: path.join(__dirname, '../.env') })

// export const update = async (params, newInfos) => {
//   try {
//     const resp = await axios({
//       method: 'PUT',
//       url: `http://localhost:3000/api/posts/${params}`,
//       data: newInfos
//     })

//     return resp
//   } catch (err) {
//     console.log(err)
//   }
// }

export const pinJSONToIPFS = async json => {
  try {
    const resp = await axios({
      method:'POST',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data: json,
      headers: {
        pinata_api_key: process.env.PINATA_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET
      }
    })

    return resp
  } catch (err) {
    console.log(err)
  }
}

export const pinFileToIPFS = async file => {
  try {
    let data = new FormData()
    data.append('file', fs.createReadStream(file))

    await axios({
      method:'POST',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data: file,
      maxContentLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET
      }
    })
    console.log(resp.data.IpfsHash)

    return resp
  } catch (err) {
    console.log(err)
  }
}

export const sendImgIpfs = async buffer => {
  try {
    const respImgHash = await ipfs.add(buffer)
    const ipfsImgHash = respImgHash[0].hash
    const resp = await pinata.pinByHash(ipfsImgHash)
    console.log(resp)

    return ipfsImgHash
  } catch (err) {
    console.log(err)
  }
}

const execute = async () => {
  const downloadFile = async (datas, downloadFolder) => {
    const params = datas.id
    const fileUrl = datas.assertURI
    const fileName = path.basename(fileUrl);
    const localFilePath = path.resolve(__dirname, downloadFolder, fileName)

    try {
      const resp = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
      })

      let newInfos
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

        const resultPin = await pinJSONToIPFS(newInfos)
        console.log(resultPin.data.IpfsHash)

        // await update(params, newInfos)

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


  // const CID = 'QmaQNPLWTSKNXCvzURSi3WrkywJ1qcnYC56Dw1XMrxYZ7Z'
  // const result = await ipfs.files.get(CID)
  // result.forEach(file => {
  //   console.log(file.path)
  //   console.log(file.content.toString('utf8'))
  // })

}
execute()
