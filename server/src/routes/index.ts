import {Request, Response, Router} from "express"
import bcrypt from "bcrypt"
import {User} from "../models/User" 
import jwt, {JwtPayload} from "jsonwebtoken"
import {validateToken} from "../middleware/validateToken"
import {Book, IBook} from "../models/Book"
//import upload from "../middleware/multer-config"


const router: Router = Router()

const userList: User[] = []

router.post("/book", async (req: Request, res: Response) => {
        const {name,author,pages} = req.body

        const newBook = new Book({
            name,
            author,
            pages
        })

        await newBook.save()
        res.status(201).json(newBook)
    }
)

router.get("/book/:name", async (req: Request, res: Response) => {
    const {name} = req.params
    const book = await Book.findOne({name: name})

    if(book) {
        res.status(200).json(book)
    } else {
        res.status(404)
    }
})

router.post("/api/user/register", (req: Request, res: Response) => {

        const email = req.body.email
        const password = req.body.password

        const userExist = userList.find(user => user.email === email)
        if(userExist) {
            return res.status(403).json({error: "User with the same email exists"})
        }

        const salt: string = bcrypt.genSaltSync(10)
        const hash: string = bcrypt.hashSync(password, salt)

        const newUser: User = {
            email: email,
            password: hash
        }

        userList.push(newUser)
        res.status(200).json(newUser)
    }
)

router.get("/api/user/list", (req: Request, res: Response) => {
    res.status(200).json(userList)
})

router.post("/api/user/login",(req: Request, res: Response) => {
    const email = req.body.email
    const password = req.body.password

    const user = userList.find(user => user.email === email
    )
    if (!user) {
        return res.status(401).json({success: false, message: "User not found"})
    }

    if (bcrypt.compareSync(password, user.password)) {
        const jwtPayload: JwtPayload = {
            email: user.email
        }
        const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, {expiresIn: "10m"})

        return res.status(200).json({success: true, token: token})
    } 

    return res.status(401).json({success: false, message: "Login failed"})
        
} )

router.get("/api/private", validateToken, (req: Request, res: Response) => {
    res.status(200).json({message:"This is protected secure route!"})
})


export default router