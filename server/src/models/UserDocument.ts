import mongoose, {Document, Schema } from "mongoose"

interface IUserDocument extends Document {
    name: string
    text: string
    user: mongoose.Types.ObjectId
    createdAt: Date
    modifiedAt: Date
    sharedEditWith: mongoose.Types.ObjectId[]
    sharedViewWith: mongoose.Types.ObjectId[]
    isPublic: Boolean
    isLocked: Boolean
    isTrashed: Boolean
}

let userDocumentSchema: Schema = new Schema ({
    name: {type: String, required: true},
    text: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, required: true},
    sharedEditWith: [{type: Schema.Types.ObjectId}],
    sharedViewWith: [{type: Schema.Types.ObjectId}],
    isPublic: {type: Boolean, default: false},
    isLocked: {type: Boolean, default: false},
    isTrashed: {type: Boolean, default: false}



}, {timestamps: true})


const UserDocument: mongoose.Model<IUserDocument> = mongoose.model<IUserDocument>("UserDocument", userDocumentSchema)
export {UserDocument, IUserDocument}