import React, { useState } from 'react'
import BookPage from "./components/BookPage"
import NotFoundPage from "./components/NotFoundPage"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import "./App.css"

const addBook = async (name: string, author: string, pages: number) => {
  try {
    const response = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        author,
        pages
      })
    })
    if (response.ok) {
      const data = await response.json()
      console.log(data)   
    }
 
  } catch (error) {
    console.log(error)
  }

  
}

function FormThing() {
  const [name, setName] = useState("")
  const [author, setAuthor] = useState("")
  const [pages, setPages] = useState("")


  const clearInput = () => {
    setName("")
    setAuthor("")
    setPages("")
  }

     
  return (
    <div>
      <h1>Books</h1>

      
        <input type="text" id="name" placeholder='NAME' value={name} onChange={(e) => setName(e.target.value)} />
        <br />
        <input type="text" id="author" placeholder='AUTHOR' value={author} onChange={(e) => setAuthor(e.target.value)} />
        <br />
        <input type="text" id="pages" placeholder='PAGES' value={pages} onChange={(e) => setPages(e.target.value)} />
        <br />
        <input type="submit" id="submit" value="SUBMIT" 
        onClick={async () => {
          await addBook(name, author, Number(pages))
          clearInput()
        }} 
        />
    </div>
  )
}

function App() {
  return(
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<FormThing />}/>
        <Route path="/book/:bookName" element={<BookPage />}/>
        <Route path="/*" element={<NotFoundPage/>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
