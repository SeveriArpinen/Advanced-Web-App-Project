import { useEffect, useState } from 'react'
import {useParams} from "react-router-dom"
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { jsPDF } from "jspdf";

// page for each document



interface IDocument {
    _id: string
    name: string
    text: string
}

const Document = () => {
    const {id} = useParams()
    const [jwt, setJwt] = useState<string | null>(null)
    const [name, setName] = useState<string>("")
    const [text,setText] = useState<string>("")
    const [owner, setOwner] = useState<string>("")
    const [isOwner, setIsOwner] = useState<boolean>(false)
    const [shareUsers, setShareUsers] = useState<IShareUser[]>([])
    const [shareEmail, setShareEmail] = useState<string>("")
    const [sharePermission, setSharePermission] = useState<string>("view")
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false)
    const [isPublic, setIsPublic] = useState<boolean>(false)
    const [isUnsaved, setIsUnsaved] = useState<boolean>(false)


    // check for jwt
    useEffect(() => {
        if(localStorage.getItem("token")) {
            setJwt(localStorage.getItem("token"))
        }
    }, [])

    // IF JWT, calls fetchdocuments
    useEffect(() => {
        if(jwt) 
            fetchDocument()
    },[jwt])

    // HELP FOR THIS FROM: https://javascript.plainenglish.io/how-to-alert-a-user-before-leaving-a-page-in-react-a2858104ca94
    // AND COPILOT
    // Before leaving the site, check if unsaved edits, if yes then alert user 
    useEffect(() => {
        const alertUser = (e: BeforeUnloadEvent) => {
            if(isUnsaved) {
                e.preventDefault()
                e.returnValue =""
            }
        }
        window.addEventListener("beforeunload", alertUser)
        return () => window.removeEventListener("beforeunload", alertUser)
    })

    // CLEANUP FUNCTION for leaving the page, makes document unlocked so it can be edited again

    // this may not work if you close the tab, can stay locked??????
    useEffect(() => {
        return() => {
            if(jwt && id) {
                fetch(`/api/document/${id}/unlock`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                })
            }
        }
    }, [jwt, id])

    // function for getting the document with id
    // has alot of checks for owner, viewed or editor
    const fetchDocument = async () => {
        try {
            const response = await fetch(`/api/document/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            })

            if(!response.ok) {
                throw new Error("Error while fetching documents")
            }

            const data = await response.json()

            setName(data.document.name)
            setText(data.document.text)
            setIsPublic(data.document.isPublic)

            // Getting the owner
            const ownerRes = await fetch(`/api/user/${data.document.user}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            })

            const ownerData = await ownerRes.json()
            setOwner(ownerData.email)
            const userEmail = localStorage.getItem("userEmail")
            let isOwner = false

            if(ownerData.email === userEmail) {
                isOwner = true
                setIsOwner(true)
            }

            // CHECK FOR LOCKED (being edited), owner can still open always!
            if(data.document.isLocked === true && isOwner === false) {
                alert("This document is currently being edited by someone else. You can only view it for now!")
                setIsReadOnly(true)
            } 

            
            //chekc if user is the owner of the dox, if not go read only

            let hasEditPermission = isOwner // this will save also for locking the documetn   
            if(!isOwner) { //if not owner lets check for the list of editors
                for(let i = 0; i < data.document.sharedEditWith.length; i++) { // get all editors
                    
                    const editRes = await fetch(`/api/user/${data.document.sharedEditWith[i]}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${jwt}`
                        }
                        })
                        if(editRes.ok) {
                            const editUserData = await editRes.json()
                            if(editUserData.email === userEmail) { //if user email is in edit list
                                hasEditPermission = true // has edit perms
                                break
                            }
                        }
                }
                if(!hasEditPermission) {
                    setIsReadOnly(true)
                }
            }
            
            // checkign if there is unsaved text
            const textUnSaved = localStorage.getItem(`not_saved_${id}`)
            if(textUnSaved !== null && textUnSaved !== data.document.text) {
                confirmAlert({
                    title: "Unsaved changes in document",
                    message: "You have unsaved changes in the document, do you want to restore them?",
                    buttons: [
                        {
                            label: "Yeah",
                            onClick: () => {
                                setText(textUnSaved)
                                setIsUnsaved(true)
                            }
                        },
                        {
                            label: "Nope",
                            onClick: () => {
                                localStorage.removeItem(`not_saved_${id}`)
                            }
                        }
                    ]
                })
            }

            // if not locked, call it to be locked
            // checks that you are not in readonly mode

            if(hasEditPermission === true && data.document.isLocked === false) {
                await fetch(`/api/document/${id}/lock`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                })
            }


            // get shared users
            await fetchShared(data.document.sharedEditWith, data.document.sharedViewWith)

        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to fetch documents: ${error.message}`)
            }
        }
    }


    //interface for shared users
    interface IShareUser{
        _id: string
        email: string
        permission: "edit" |"view"
    }
    // GET SHARED USERS EMAILS WITH ID's
    const fetchShared = async (editUsers: string[], viewUsers: string[]) => {
        const users: IShareUser[] = []
        
        //edit users
        for(let i = 0; i < editUsers.length; i++) {
            try {
                const response = await fetch(`/api/user/${editUsers[i]}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                })
                if(!response.ok){
                    throw new Error("Error while fetching documents")
                }

                const data = await response.json()
                users.push({_id: editUsers[i], email: data.email, permission: "edit"})

            } catch (error) {
                if (error instanceof Error) {
                console.log(`Error when trying to fetch users: ${error.message}`)
                }
            }
        }

        // view users
        for(let i = 0; i < viewUsers.length; i++) {
            try {
                const response = await fetch(`/api/user/${viewUsers[i]}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                })
                if(!response.ok){
                    throw new Error("Error while fetching documents")
                }

                const data = await response.json()
                users.push({_id: viewUsers[i], email: data.email, permission: "view"})

            } catch (error) {
                if (error instanceof Error) {
                console.log(`Error when trying to fetch users: ${error.message}`)
                }
            }
        }
    
        setShareUsers(users)
    }

    // funct for sharing the document
    const shareDocument = async () => {
        try {
            const response = await fetch(`/api/document/${id}/share`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    email: shareEmail,
                    permission: sharePermission
                })
            })

            if(!response.ok){
                throw new Error("Error while sharing documents")
                
            }

            alert("document shared")
            setShareEmail("")
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to share: ${error.message}`)
            }
        }
    }

    // func for removing share from user
    const removeShare = async(shareUser: string) => {
        try {
            const response = await fetch(`/api/document/${id}/share/${shareUser}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            })

            if(!response.ok) {
                throw new Error("Error removing share")
            }
            
            alert("Share removed!")
            fetchDocument()
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to share: ${error.message}`)
            }
        }
    }

    // saves the document,
    const saveDocument = async () => {
        try {
            const response = await fetch(`/api/document/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    name: name,
                    text: text
                })
            })

            if(!response.ok) {
                throw new Error("Error while saving document")
            }

            localStorage.removeItem(`not_saved_${id}`)
            setIsUnsaved(false)
            console.log("document saved")
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to fetch documents: ${error.message}`)
            }
        }
    }

    // funct for making document public --- can be viewed with the link
    const makePublic = async () => {
        try {
            const response = await fetch(`/api/document/${id}/public`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({isPublic: true})
            })

            if(!response.ok){
                throw new Error("Error making document public!!")
            }

            setIsPublic(true)
            alert("Document is now public")
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to fetch documents: ${error.message}`)
            }
        }
    }

    // funct for making the document private, cant be viewed unauthorized
    const makePrivate = async () => {
        try {
            const response = await fetch(`/api/document/${id}/public`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({isPublic: false})
            })

            if(!response.ok){
                throw new Error("Error making document private!!")
            }

            setIsPublic(false)
            alert("Document is now private")
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to fetch documents: ${error.message}`)
            }
        }
    }

    // function for text change, sets unsaved to true, calls set text for new text and stores unsaved changes to localstorage
    
    const textChange = (text: string) => {
        setText(text)
        setIsUnsaved(true)
        localStorage.setItem(`not_saved_${id}`, text)
    }


    // FUnction for pressing go back button, makes sure that the document gets unlocked
    // CHECKS FOR JWT, ID AND THAT IS NOT READ ONLY!

    // IF USER LEAVES THE PAGE AND DOES NOT CLICK THE "GO BACK BUTTON" THE DOCUMENT GETS LOCKED PERMANENTLY
    // UNFORTUNATE BUT IT HAPPENS !!!!!!!
    
    // now the owner can always access the document so its not locked forever

    // todo: (fiksaa tää jotenkin??????)
    const goBackToDocs = async () => {
            if(jwt && id && !isReadOnly) {
                await fetch(`/api/document/${id}/unlock`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                })
            }
            window.location.href = "/documents"
    }

    // DOWNLOAD AS A PDF
    // LIBRARY USED JSPDF (https://github.com/parallax/jsPDF): 
    // Help from this documentation: https://artskydj.github.io/jsPDF/docs/jsPDF.html
    // and copilot 
    const downloadAsPDF = () => {
        const doc = new jsPDF()
        
        //document name
        doc.setFontSize(20)
        doc.text(name, 105, 20, {align: "center"})

        // line before text
        doc.setLineWidth(1)
        doc.line(10, 30, 200, 30)
        
        // text in doc
        doc.setFontSize(12)

        //split text to fit in page
        const splitText = doc.splitTextToSize(text, 180)
        
        // keeping track if need a new page, checking y placement
        // 280 is max amount, if y gets larger, make a new page and reset to top of page y = 20
        let y = 50
        for(let i = 0; i < splitText.length; i++) {
            if(y > 280) {
                doc.addPage()
                y=20
            }
            doc.text(splitText[i],15,y) // add new line of text
            y = y+7 // move down 7mm, good for one line of text
        }
        // save pdf
        doc.save(`${name}.pdf`)
    }



    /// OWNER AND EDITOR ONLY SEES SHARE AND SAVING
    return(
        <div className="container mt-5">
            
            {!jwt ? (
                <div className="alert alert-warning">Please <a href="/login">login</a> to fetch documents.</div>
            ): (
                <>
                <div className="card shadow mb-5">
                    <div className="card-header">
                        <h3 className="">Document name: {name}   |   Owner: {owner}</h3>
                    </div>
                    <div className="card-body">
                        {isReadOnly && (
                            <div className="alert alert-warning">You can't edit this document, its for view only.</div>)}
                        
                        <div className="mb-4">
                            <label className="form-label"> Document name</label>
                            <input type="text" 
                            placeholder='Document name' value={name}
                            onChange={(e) => setName(e.target.value)}
                            readOnly={isReadOnly}
                            className="form-control"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Content</label>
                            <textarea 
                            className="form-control"
                            placeholder="document text" value={text}
                            onChange={(e) => textChange(e.target.value)}
                            readOnly={isReadOnly} 
                            rows={15}
                            style={{resize: "none"}}

                            />
                        </div>
                        
                        <div className="d-flex gap-3">
                            {!isReadOnly && (<button className="btn btn-success" onClick={() => saveDocument()}>Save document</button>)}
                            <button className="btn btn-secondary" onClick={() => downloadAsPDF()}>Download as a PDF</button>
                            <button className="btn btn-primary" onClick={() => goBackToDocs()}>Go back!</button>
                        </div>
                    </div>
                </div>

                {isOwner &&(
                <div className="card shadow">
                    <div className="card-header">
                        <h3 className="mb-4">Share this document</h3>
                    </div>
                    <div className='card-body'>
                        {shareUsers.length > 0 && (
                            <div className='mb-3'>
                                <h5>Shared currently with:</h5>
                                <ul className="list-group">
                                    {shareUsers.map(user => (
                                        <li key={user._id} className='list-group-item d-flex justify-content-center gap-3 align-items-center'>
                                            <span>
                                                {user.email} 
                                                <span className="badge bg-primary ms-3">({user.permission})</span>
                                            </span>
                                            <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => removeShare(user._id)}>
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <h5 className="mt-3">Share with new user</h5>
                        <div className="row gap-3 mb-5">
                            <div className="mb-1">
                                <input className='form-control' 
                                type="email" placeholder='email' 
                                value={shareEmail} onChange={(e) => setShareEmail(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <select className="form-select"
                                value={sharePermission} onChange={(e) => setSharePermission(e.target.value)}>
                                    <option value="view">View</option>
                                    <option value="edit">Edit</option>
                                </select>   
                            </div>
                            <div className='col-md-2'>
                                <button className="btn btn-primary w-100" onClick={() => shareDocument()}>Share!</button>
                            </div>
                        </div>


                        <h5 className="mb-3">Public sharing</h5>
                        <div className="mb-3">
                            {isPublic ? (
                                <button className="btn btn-warning mb-3" onClick={() => makePrivate()}>Make private</button>
                            ) : (
                                <button className="btn btn-primary mb-3"onClick={() => makePublic()}>Make public</button>
                            )}
                            {isPublic && (
                                <div className="alert alert-info">
                                    <strong>Public link for anyone to view the document:   
                                        <a className=""href={`/public/document/${id}`}>View public document</a>
                                    </strong>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
                
                )}
                </>
            )}
        </div>
    )
}

export default Document