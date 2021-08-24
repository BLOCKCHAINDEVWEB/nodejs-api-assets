import dotenv from 'dotenv'
import path from 'path'
import pinataSDK from '@pinata/sdk'
dotenv.config({ path: path.join(__dirname, '../../.env') })

const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET)

export default pinata
