import mongoose, {Document, Schema } from "mongoose"

interface IBook extends Document {
    name: string
    author: string
    pages: number
}

let bookSchema: Schema = new Schema ({
    name: {type: String, required: true},
    author: {type: String, required: true},
    pages: {type: Number, required: true}
})


const Book: mongoose.Model<IBook> = mongoose.model<IBook>("Book", bookSchema)
export {Book, IBook}