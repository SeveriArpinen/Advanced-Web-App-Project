import React, { useState } from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import Documents from "./components/Documents"
import Document from "./components/Document"
import PublicDocument from "./components/PublicDocument"
import "./App.css"


function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<Login/>} />
        <Route path="/login" element = {<Login/>} />
        <Route path="/register" element = {<Register/>} />
        <Route path="/documents" element = {<Documents/>} />
        <Route path="/document/:id" element = {<Document/>} />
        <Route path="/public/document/:id" element = {<PublicDocument/>} />

      </Routes>
    
    </BrowserRouter>
  )
}
export default App
