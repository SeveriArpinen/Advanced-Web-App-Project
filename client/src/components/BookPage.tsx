import { useEffect, useState } from 'react'
import {useParams} from "react-router-dom"

interface IBook {
    name: string
    author: string
    pages: number
}

const BookPage = () => {
    const params = useParams()
    const bookName = params.bookName

    const [book, setBook] = useState<IBook | null>(null)

    const fetchData = async () => {
        const response = await fetch(`/api/book/${bookName}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const data = await response.json()
        setBook(data)
    }

    useEffect(() => {
        fetchData()
    }, [bookName])


    if (book) {
        return (
            <div>
                <h1>Books</h1>
                <p>{book.name}</p>
                <p>{book.author}</p>
                <p>{book.pages}</p>
            </div>
        )
    } else {
        return (
            <div>
                <p>Book not found??????</p>
            </div>
        )
    }


}

export default BookPage