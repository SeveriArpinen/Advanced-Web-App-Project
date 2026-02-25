import {useEffect, useState} from "react"
import {useParams} from "react-router-dom"

const PublicDocument = () => {
    const {id} = useParams()
    const[name, setName] = useState<string>("")
    const[text, setText] = useState<string>("")

    useEffect(() => {
        fetchPublicDocument()
    }, [])

    const fetchPublicDocument = async () => {
        try {
            
            const response = await fetch(`/api/public/document/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if(!response.ok){
                throw new Error("Error finding public document")
            }

            const data = await response.json()
            setName(data.document.name)
            setText(data.document.text)
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error when trying to fetch public document: ${error.message}`)
            }
        }
    }


    return(
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header">
                    <h2>Public document: {name}</h2>
                </div>
                <div className="card-body">
                    <div className="alert alert-info">
                        This document is made public, anyone can view it
                    </div>

                    <div className="mb-5">
                        <label className="form-label">Document name</label>
                        <input className="form-control" type="text" value={name} readOnly/>
                    </div>
                    <div className="mb-5">
                        <label className="form-label">Content</label>
                        <textarea className="form-control" value={text} readOnly
                        rows={15}
                        style={{resize: "none"}}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicDocument