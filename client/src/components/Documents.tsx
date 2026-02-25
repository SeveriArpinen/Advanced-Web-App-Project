import { useEffect, useState } from 'react'

// THIS IS THE CODE FOR THE DOCUMENTS PAGE, PROTECTED ROUTE, CHECKS FOR THE JWT BEFORE GETTING THE DOCUMENTS
interface IDocument {
    _id: string
    name: string
    text: string
    user: string
    ownerEmail?: string
    createdAt: Date
    updatedAt: Date
}
const Documents = () => {
    const [jwt, setJwt] = useState<string | null>(null)
    const [ownedDocuments, setOwnedDocuments] = useState<IDocument[]>([])
    const [sharedEditDocuments, setSharedEditDocuments] = useState<IDocument[]>([])
    const [sharedViewDocuments, setSharedViewDocuments] = useState<IDocument[]>([])
    const [trashedDocuments, setTrashedDocuments] = useState<IDocument[]>([])
    const [searchName, setSearchName] = useState<string>("")
    const [documentsShown, setDocumentsShown] = useState<number>(5)


    // check for jwt
    useEffect(() => {
        if(localStorage.getItem("token")) {
            setJwt(localStorage.getItem("token"))
        }
    }, [jwt])

    // fetches documents automatically when jwt is found
    useEffect(() => {
        if(jwt){
            fetchDocuments()
            fetchSharedDocuments()
        }
    }, [jwt])

    // gets all users owned documents
    const fetchDocuments = async () => {
        try {
            const response = await fetch("/api/documents/owned", {
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
            setOwnedDocuments(data.documents)
            console.log(data.documents)

        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to fetch documents: ${error.message}`)
            }
        }
    }


    // function for getting shared documents
    const fetchSharedDocuments = async () => {

        try {
            const response = await fetch("/api/documents/shared", {
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

            // get owner emails for both shared edit and view
            // messy but works i guess

            const editDocumentsAndOwners: IDocument[] = []

            for(let i = 0; i < data.sharedEdit.length; i++) {
                try {
                    const ownerResponse = await fetch(`/api/user/${data.sharedEdit[i].user}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                    })
                    if(!ownerResponse.ok) {
                        throw new Error("Error while fetching owners email")
                    }
                    const ownerData = await ownerResponse.json()
                    editDocumentsAndOwners.push({...data.sharedEdit[i], ownerEmail: ownerData.email})

                } catch (error) {
                    if (error instanceof Error) {
                        console.log(`Error when trying to fetch documents: ${error.message}`)
                    }
                }


            }
            const viewDocumentsAndOwners: IDocument[] = []

            for(let i = 0; i < data.sharedView.length; i++) {
                try {
                    const ownerResponse = await fetch(`/api/user/${data.sharedView[i].user}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                    })
                    if(!ownerResponse.ok) {
                        throw new Error("Error while fetching owners email")
                    }
                    const ownerData = await ownerResponse.json()
                    viewDocumentsAndOwners.push({...data.sharedView[i], ownerEmail: ownerData.email})

                } catch (error) {
                    if (error instanceof Error) {
                        console.log(`Error when trying to fetch documents: ${error.message}`)
                    }
                }
            }
            setSharedEditDocuments(editDocumentsAndOwners)
            setSharedViewDocuments(viewDocumentsAndOwners)

            
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to fetch documents: ${error.message}`)
            }
        }
    }
    // function for trashing document
    const trashDocument = async (id: string) => {
        try {
            const response = await fetch(`/api/document/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            })

            if(!response.ok) {
                throw new Error("Error while deleting document")
            }

            fetchDocuments() // fetch again after deleting
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to delete document: ${error.message}`)
            }
        }
    }

    // function for making a new blank document
    const newDocument = async () => {
        try {
            const response = await fetch(`/api/document/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    name: "New Document",
                    text: " "
                })
            })

            if(!response.ok) {
                throw new Error("Error while creating document ")
            }
            const data = await response.json()
            window.location.href = `/document/${data.document._id}`
            
            fetchDocuments() // fetch again after making new document
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to create documents: ${error.message}`)
            }
        }
    }


    // function for logout button
    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userEmail")
        window.location.href = "/login"
    }

    // get trashed documents
    const fetchTrashed = async () => {
        try {
            const response = await fetch(`/api/documents/trash`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            })

            if(!response.ok) {
                throw new Error("Error while creating document ")
            }

            const data = await response.json()
            setTrashedDocuments(data.documents)
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to create documents: ${error.message}`)
            }
        }
    }

    //restoring document from trash
    const restoreDocument = async (id: string) => {
        try {
            const response = await fetch(`/api/document/${id}/restore`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            })

            if(!response.ok) {
                throw new Error("Error while creating document ")
            }

            alert("document is restored")
            fetchTrashed()
            fetchDocuments()
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to create documents: ${error.message}`)
            }
        }
    }

    // delete document completely
    const deleteDocument = async (id: string) => {
        try {
            const response = await fetch(`/api/document/${id}/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            })

            if(!response.ok) {
                throw new Error("Error while creating document ")
            }

            alert("document deleted")
            fetchTrashed()

        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to create documents: ${error.message}`)
            }
        }
    }

    // document for filtering with searchName
    // copilot helped with the return logic
    const findDocuments = (documents: IDocument[]) => {
        if (searchName.trim() === "") {
            return documents
        } else {
            const search = searchName.toLowerCase()
            return (
                documents.filter(document => document.name.toLowerCase().includes(search))
            )
        }
    }

    const cloneDocument = async (name: string, text: string) => {
        try {
            const response = await fetch(`/api/document/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    name: `Cloned - ${name}`,
                    text: text
                })
            })

            if(!response.ok) {
                throw new Error("Error while creating document ")
            }

            alert("document cloned!")
            fetchDocuments()

        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to create documents: ${error.message}`)
            }
        }
    }

    // function for pagination, shows 5 at a time
    const showMore = () => {
        setDocumentsShown(documentsShown + 5)
    }

    return(
        <div className="container mt-5">
            
                <h2 className="mb-5">My Documents!</h2>
                {!jwt ? (
                    <div className="alert alert-warning">Please <a href="/login">login</a> to fetch documents.</div>
                ): (
                    <>
                    <div className="d-flex justify-content-center mb-4 align-items-center">
                        <button className="btn btn-danger"onClick={() => logout()}>Logout!</button>
                        <button className="btn btn-success"onClick={() => newDocument()}>Make a new document</button>
                    </div>


                <button className="btn btn-warning mb-3" type="button" data-bs-toggle="collapse" 
                data-bs-target="#collapse" aria-expanded="false" aria-controls="collapse"
                onClick={() => fetchTrashed()}>
                    View trash
                </button>


                <div className="collapse mb-3" id="collapse">
                    <div className="card card-body">
                        <h4 className="mb-3">Trashed documents</h4>
                        <div className="list-group">
                            {trashedDocuments.map((document) =>  (
                                <div key={document._id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <h6 className="mb-2">{document.name}</h6>  
                                    <div>
                                        <button className="btn btn-success btn-sm me-2"
                                        onClick={() => restoreDocument(document._id)}>
                                        Restore    
                                        </button>
                                        <button className="btn btn-danger btn-sm"
                                        onClick={() => deleteDocument(document._id)}>Delete
                                        </button>    
                                    </div>  
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                    
                <div className="mb-3">
                    <label className="form-label"> Search </label>
                    <input type="text"
                    className="form-control"
                    placeholder="search for a document..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)} />
                </div>

                    <div className="mb-5">
                        <div className="list-group">
                            <h2 className="mb-3">Owned Documents</h2>
                            {/*filter search with findDocuments, pagination is done with slice  */}
                            {findDocuments(ownedDocuments).slice(0, documentsShown).map((document) => (
                                <div key={document._id} className="list-group-item">
                                    <div>
                                        <h4 className="mb-3">{document.name}</h4>
                                        <small className="text-muted mb">
                                        Created: {new Date(document.createdAt).toLocaleString()} |
                                        Modified: {new Date(document.updatedAt).toLocaleString()} 
                                        </small>
                                    </div>
                                        <button className="btn btn-secondary me-3" onClick={() => cloneDocument(document.name, document.text)}>Make a clone</button> 
                                        <button className="btn btn-danger me-3" onClick={() => trashDocument(document._id)}>Trash </button>  
                                        <button className="btn btn-primary" onClick={() => window.location.href = `/document/${document._id}` }>Edit</button>
                                        
                                </div>
                            ))}
                        </div>
  
                        
                        {documentsShown < findDocuments(ownedDocuments).length && (
                            <button className="btn btn-primary mt-3" onClick={() => showMore()}>Show more documents...</button>
                        )}
                    </div>

                    <div className="mb-5">
                        <div className="list-group">
                            <h2 className="mb-3">Shared with me for editing</h2>
                            {findDocuments(sharedEditDocuments).map((document) => (
                                <div key={document._id} className="list-group-item">
                                    <div>
                                        <h4 className="mb-1">{document.name}</h4>
                                        <p>Owner: {document.ownerEmail}</p>
                                        <small className="text-muted me-3">
                                            Created: {new Date(document.createdAt).toLocaleString()} |
                                            Modified: {new Date(document.updatedAt).toLocaleString()} 
                                        </small>
                                        <button className="btn btn-primary"onClick={() => window.location.href = `/document/${document._id}` }>Edit</button> 
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>

                    <div className="mb-5">
                        <div className="list-group">
                            <h2 className="mb-3">Shared with me for viewing</h2>
                            {findDocuments(sharedViewDocuments).map((document) => (
                                <div key={document._id} className="list-group-item">
                                    <div>
                                        <h4 className="mb-1">{document.name}</h4>
                                        <p>Owner: {document.ownerEmail}</p>
                                        <small className="text-muted me-3">
                                            Created: {new Date(document.createdAt).toLocaleString()} |
                                            Modified: {new Date(document.updatedAt).toLocaleString()} 
                                        </small>
                                        <button className="btn btn-primary"onClick={() => window.location.href = `/document/${document._id}` }>View</button> 
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                        
                    
                    </>
                )}
            
        </div>
    )
}

export default Documents