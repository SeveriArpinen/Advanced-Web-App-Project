import express, {Express, Request, Response} from "express"
import morgan from "morgan"
import path from "path"
import router from "./src/routes/index"
import mongoose, { Connection } from "mongoose"
import dotenv from "dotenv"
import cors, {CorsOptions} from "cors"
dotenv.config()

const app: Express = express()
const port = 1234


const mongoDB: string = "mongodb://localhost:27017/project"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection =mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error"))

const corsOptions: CorsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(morgan("dev"))

app.use("/api", router)


app.listen(port, () => {
    console.log(`Server running on port ${port}`)

})