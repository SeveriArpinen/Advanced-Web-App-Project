import {Request, Response, Router} from "express"
import bcrypt from "bcrypt"
import {User, IUser} from "../models/User"
import {UserDocument, IUserDocument} from "../models/UserDocument" 
import jwt, {JwtPayload} from "jsonwebtoken"
import {CustomRequest, validateToken} from "../middleware/validateToken"

//import upload from "../middleware/multer-config"


const router: Router = Router()


// USER ROUTES---------------------------------------------------------------


// GET USER EMAIL by id

router.get("/user/:userId", validateToken, async(req: Request, res: Response) => {
    try {
        const {userId} = req.params

        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message: "user not found!!!"})
        }
        res.status(200).json({email: user.email})

    } catch (error) {
        res.status(500).json({error: "getting user failed!!"})
        console.log(error)
    }
})

// REGISTER ROUTE
// CHECKS IF EMAIL ALREADY IN USE, SAVES NEW USER TO DB WITH HASHED PASSWORD

router.post("/user/register", async (req: Request, res: Response) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const userExist = await User.findOne({email: email})
        if(userExist) {
            return res.status(403).json({error: "User with the same email exists"})
        }

        const salt: string = bcrypt.genSaltSync(10)
        const hash: string = bcrypt.hashSync(password, salt)

        const newUser = new User({
            email: email,
            password: hash
        })
        await newUser.save()
        res.status(200).json({message: "User registered!"})

    } catch (error) {
        res.status(500).json({error: "User register failed"})
    }

})

//LOGIN ROUTE
// FIRST CHECKS IF USER EXISTS, THEN COMPARES PASSWORDS, IF ALL OK, CREATES TOKEN WITH JWT

router.post("/user/login", async (req: Request, res: Response) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const user = await User.findOne({email:email})
        
        if (!user) {
            return res.status(401).json({success: false, message: "User not found"})
        }

        if (bcrypt.compareSync(password, user.password)) {
            const jwtPayload: JwtPayload = {
                email: user.email,
                userId: user._id.toString()
            }
            const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, {expiresIn: "1h"})

            return res.status(200).json({success: true, token: token})
        } 

        return res.status(401).json({success: false, message: "Login failed"})
        
    } catch (error) {
        res.status(500).json({error: "login failed!!"})
    }
} )

// DOCUMNET ROUTES -------------------------------------------------------------
// validateToken validates the token before routing requests


// ROUTE FOR MAKING A NEW DOCUMENT
// FIRST VALIDATES TOKEN AND CHECKS FOR USER ID , THEN CREATES NEW DOCUMENT

router.post("/document", validateToken, async(req: Request, res: Response) => {
    try {
        const name= req.body.name
        const text = req.body.text
        const userId = (req as CustomRequest).user?.userId

        const newDocument = new UserDocument({
            name,
            text: text,
            user: userId
        })

        await newDocument.save()
        res.status(200).json({message: "New document added", document: newDocument})

    } catch (error) {
        res.status(500).json({error: "adding document failed!!"})
        console.log(error)
    }
})

// GET OWNED DOCUMENTS
router.get("/documents/owned", validateToken, async(req: Request, res: Response) => {
    try {
        const userId = (req as CustomRequest).user?.userId
        const documents = await UserDocument.find({user: userId, isTrashed: false})



        res.status(200).json({message: "owned documents found", documents})

    } catch (error) {
        res.status(500).json({error: "finding documents failed!!"})
        console.log(error)

    }
})

//GET SHARED DOCUMENTS

router.get("/documents/shared", validateToken, async(req: Request, res: Response) => {
    try {
        const userId = (req as CustomRequest).user?.userId

        const sharedEdit = await UserDocument.find({sharedEditWith: userId, isTrashed: false})
        const sharedView = await UserDocument.find({sharedViewWith: userId, isTrashed: false})


        res.status(200).json({message: "shared documents found",sharedEdit, sharedView})

    } catch (error) {
        res.status(500).json({error: "finding documents failed!!"})
        console.log(error)

    }
})


// GETS ALL OF USERS DOCUMENTS ---- Maybe dont need this??????
router.get("/documents", validateToken, async(req: Request, res: Response) => {
    try {
        const userId = (req as CustomRequest).user?.userId
        const documents = await UserDocument.find({user: userId, isTrashed: false})

        const sharedEdit = await UserDocument.find({sharedEditWith: userId, isTrashed: false})
        const sharedView = await UserDocument.find({sharedViewWith: userId, isTrashed: false})


        res.status(200).json({message: "Documents found", documents, sharedEdit, sharedView})

    } catch (error) {
        res.status(500).json({error: "finding documents failed!!"})
        console.log(error)

    }
})

// MAKING DOCUMENT PUBLIC ROUTE
router.put("/document/:id/public", validateToken, async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const userId = (req as CustomRequest).user?.userId
        const isPublic = req.body.isPublic // client sends true or false

        const document = await UserDocument.findById(id)
        if(!document){
            return res.status(404).json({message: "error finding document"})
        }

        if(document.user.toString() !== userId) {
            return res.status(500).json({message: "Only owner can make document public"})
        }

        document.isPublic = isPublic
        await document.save()
        res.status(200).json({message: "documents visibility updated!"})
    } catch (error) {
        res.status(500).json({message: "failed updating public status"})
    }
})


// GETS ONE OF USERS DOCUMENT

router.get("/document/:id", validateToken, async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const userId = (req as CustomRequest).user?.userId

        const document = await UserDocument.findById(id)
        if(!document){
            return res.status(404).json({message: "Document not found"})
        } 
        
        if(document.isTrashed === true) {
            return res.status(404).json({message: "Document is in Trash"})
        }
        
        // check for permissions owner, edit or view
        const documentOwner = document.user.toString()
        if(documentOwner === userId){
            return res.status(200).json({message: "Document found!",document})
        }
        
        // check for edit permisiion
        if(document.sharedEditWith.findIndex(id => id.toString() === userId) !== -1){
            return res.status(200).json({message: "Document found!",document})
        }

        // check for view permission
        if(document.sharedViewWith.findIndex(id => id.toString() === userId) !== -1){
            return res.status(200).json({message: "Document found!",document})
        }

        // else no access
        res.status(400).json({message: "You dont have access to this document!"})
    } catch (error) {
        res.status(500).json({error: "finding documents failed!!"})
        console.log(error)

    }
})

//DELETING DOCUMENT BY ID
// DOESNT DELETE COMPLETELY, MARKS IT AS TrashED
router.delete("/document/:id", validateToken, async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const userId = (req as CustomRequest).user?.userId

        const document = await UserDocument.findById(id)
        if(!document){
            return res.status(404).json({message: "Document not found"})
        } 

        if(document.user.toString() !== userId) {
            return res.status(500).json({message: "Access to this document is denied"})
        }

        document.isTrashed = true
        await document.save()
        res.status(200).json({message: "Document Trashed"})
    } catch (error) {
        res.status(500).json({error: "Trashing documents failed!!"})
        console.log(error)
    }
})

//DELETE DOCUMENT COMPLETELY
router.delete("/document/:id/delete", validateToken, async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const userId = (req as CustomRequest).user?.userId

        const document = await UserDocument.findById(id)
        if(!document){
            return res.status(404).json({message: "Document not found"})
        } 

        if(document.user.toString() !== userId) {
            return res.status(500).json({message: "Access to this document is denied"})
        }

        await document.deleteOne({_id: id})
        res.status(200).json({message: "Document Trashed"})
    } catch (error) {
        res.status(500).json({error: "Trashing documents failed!!"})
        console.log(error)
    }
})

// GET ALL USERS TrashED DOCUMENTS
router.get("/documents/trash", validateToken, async(req: Request, res: Response) => {
    try {
        const userId = (req as CustomRequest).user?.userId

        const documents = await UserDocument.find({user: userId, isTrashed: true})

        res.status(200).json({message: "Trashed documents found", documents})
    } catch (error) {
        res.status(500).json({error: "finding Trashed documents failed!!"})
        console.log(error)
    }
})

//RESTORING TRASHED DOCUMENT
router.put("/document/:id/restore", validateToken, async(req: Request, res: Response) => {
    try {
        const {id} = req.params

        const document = await UserDocument.findById(id)
        if(!document){
            return res.status(404).json({message: "Document not found"})
        }

        document.isTrashed = false
        await document.save()
        res.status(200).json({message: "Restored Trashed documents found"})
    } catch (error) {
        res.status(500).json({error: "restoring Trashed document failed!!"})
        console.log(error)
    }
})

// UPDATING DOCUMENT FOUDN BY ID
router.put("/document/:id", validateToken, async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const name = req.body.name
        const text = req.body.text
        const userId = (req as CustomRequest).user?.userId

        const document = await UserDocument.findById(id)
        if(!document){
            return res.status(404).json({message: "Document not found"})
        } 

        if(document.user.toString() === userId) {
            document.name = name
            document.text = text
            await document.save()
            return res.status(200).json({message: "Document updated"})
        }

        if(document.sharedEditWith.findIndex(id => id.toString() === userId) !== -1) {
            document.name = name
            document.text = text
            await document.save()
            return res.status(200).json({message: "Document updated"})
        }

        res.status(400).json({message: "you dont have edit permissions!!!"})

    } catch (error) {
        res.status(500).json({error: "updating documents failed!!"})
        console.log(error)
    }
})

// DOCUMENT SHARING ROUTES --------------------------
// SHARE DOCUMENT WITH A USER
router.post("/document/:id/share", validateToken, async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const email = req.body.email
        const permission = req.body.permission // get permission view or edit
        const userId = (req as CustomRequest).user?.userId

        // get document
        const document = await UserDocument.findById(id)
        if(!document) {
            return res.status(404).json({message:"document not found!!!"})
        }

        // get document owner
        const documentOwner = document.user.toString()
        if(documentOwner !== userId){
            return res.status(400).json({message: "Only the owner of the document can share!"})
        }

        // get shared user
        const shareWithUser = await User.findOne({email: email})
        if(!shareWithUser){
            return res.status(400).json({message: "user not found, try again"})
        }

        // get id and give right permission
        const shareWithUserId = shareWithUser._id
        if(permission === "edit") {
            document.sharedEditWith.push(shareWithUserId)
        } else {
            document.sharedViewWith.push(shareWithUserId)
        }

        await document.save()
        res.status(200).json({message: "document shared"})

    } catch (error) {
        res.status(500).json({error: "sharing document failed!!"})
        console.log(error)
    }
})

// REMOVE USER FROM SHARING
// delete route with shared users id
router.delete("/document/:id/share/:shareUserId", validateToken, async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const {shareUserId} = req.params
        const userId = (req as CustomRequest).user?.userId

        const document = await UserDocument.findById(id)
        if(!document) {
            return res.status(404).json({message:"document not found!!!"})
        }

        const documentOwner = document.user.toString()
        if(documentOwner !== userId){
            return res.status(400).json({message: "Only the owner of the document can remove share!"})
        }

        //document.sharedEditWith.pull(shareUserId)
        //remove both edit and view permissions
        document.sharedEditWith = document.sharedEditWith.filter(id => id.toString() !== shareUserId) 
        document.sharedViewWith = document.sharedViewWith.filter(id => id.toString() !== shareUserId)
        await document.save()
        res.status(200).json({message: "sharing removed!!"})

    } catch (error) {
        res.status(500).json({error: "removing sharing document failed!!"})
        console.log(error)
    }
})

// ROUTES FOR EDITING LOCK THINGYS
// "LOCKS" DOCUMENT --
router.put("/document/:id/lock", validateToken, async (req: Request, res:Response) => {
    try {
        const {id} = req.params
        const document = await UserDocument.findById(id)

        if(!document){
            return res.status(404).json({message:"document not found!!!"})
        }
        document.isLocked = true
        await document.save()
        res.status(200).json({message: "Document locked sucesfully!"})
    } catch (error) {
        res.status(500).json({error: "Error while locking document!!"})
    }
})

// "UNLOCK" DOCUMENT --- -
router.put("/document/:id/unlock", validateToken, async (req: Request, res:Response) => {
    try {
        const {id} = req.params
        const document = await UserDocument.findById(id)

        if(!document){
            return res.status(404).json({message:"document not found!!!"})
        }
        document.isLocked = false
        await document.save()
        res.status(200).json({message: "Document unlocked sucesfully!"})
    } catch (error) {
        res.status(500).json({error: "Error while unlocking document!!"})
    }
})

// PUBLIC DOCUMENT ROUTES ----------------  ------------------

// NO VALIDATION FOR THESE ROUTES FOR PUBLIC DOCUMENTSS
router.get("/public/document/:id", async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const document = await UserDocument.findById(id)

    
        if(!document) {
            return res.status(404).json({message:"document not found!!!"})
        }

        res.status(200).json({message: "document found", document})
    } catch (error) {
        res.status(500).json({error: "finding document failed!!"})
        console.log(error)
    }
})



// router.post("/api/user/register", (req: Request, res: Response) => {

//         const email = req.body.email
//         const password = req.body.password

//         const userExist = userList.find(user => user.email === email)
//         if(userExist) {
//             return res.status(403).json({error: "User with the same email exists"})
//         }

//         const salt: string = bcrypt.genSaltSync(10)
//         const hash: string = bcrypt.hashSync(password, salt)

//         const newUser: User = {
//             email: email,
//             password: hash
//         }

//         userList.push(newUser)
//         res.status(200).json(newUser)
//     }
// )

// router.get("/api/user/list", (req: Request, res: Response) => {
//     res.status(200).json(userList)
// })

// router.post("/api/user/login",(req: Request, res: Response) => {
//     const email = req.body.email
//     const password = req.body.password

//     const user = userList.find(user => user.email === email
//     )
//     if (!user) {
//         return res.status(401).json({success: false, message: "User not found"})
//     }

//     if (bcrypt.compareSync(password, user.password)) {
//         const jwtPayload: JwtPayload = {
//             email: user.email
//         }
//         const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, {expiresIn: "10m"})

//         return res.status(200).json({success: true, token: token})
//     } 

//     return res.status(401).json({success: false, message: "Login failed"})
        
// } )



export default router