import multer, {StorageEngine, Multer} from "multer"
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
const storage: StorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        const id = uuidv4()
        const extension = path.extname(file.originalname)
        const originalFilename = path.basename(file.originalname, extension)
        const filename = `${originalFilename}_${id}${extension}`
        cb(null, filename)
    }
  })
  
  const upload: Multer = multer({ storage: storage })


  export default upload