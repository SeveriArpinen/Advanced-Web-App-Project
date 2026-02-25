# Document Management System

A full-stack collaborative document management application built with React, Express, TypeScript, and MongoDB. This system allows users to create, edit, share, and manage documents with granular permissions and real-time collaboration features.

## Features

### User Management
- User registration and authentication
- JWT-based session management
- Secure password hashing with bcrypt

### Document Operations
- Create, edit, and delete documents
- Rich text editing interface
- Auto-save functionality
- Unsaved changes warning before navigation

### Collaboration
- Share documents with specific users
- Two permission levels: view-only and edit access
- Document locking to prevent concurrent editing conflicts
- View shared documents from other users

### Document Organization
- Owned documents management
- Shared documents (separate view for edit and view permissions)
- Trash functionality with restore capability
- Search documents by name

### Public Sharing
- Make documents publicly accessible
- View public documents without authentication
- Public document links

### Export
- PDF export functionality
- Download documents as PDF files

## Tech Stack

### Frontend
- React 19.2.0
- TypeScript
- React Router DOM for navigation
- Vite for build tooling
- Bootstrap for UI components
- jsPDF for PDF generation

### Backend
- Node.js with Express 5.2.1
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS enabled

### Development Tools
- ESLint for code quality
- Morgan for HTTP request logging
- Nodemon for development server
- tsc-watch for TypeScript compilation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd Project
```

### 2. Install dependencies
```bash
npm install
```

This will automatically install dependencies for both client and server.

### 3. Environment Setup

Create a `.env` file in the `server` directory:
```
SECRET=your_jwt_secret_key_here
```

### 4. Start MongoDB
Ensure MongoDB is running locally on the default port (27017):
```bash
mongod
```

## Running the Application

### Development Mode

**Start the server:**
```bash
npm run dev:server
```
Server will run on `http://localhost:1234`

**Start the client:**
```bash
npm run dev:client
```
Client will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/:userId` - Get user email (protected)

### Documents
- `POST /api/document` - Create new document (protected)
- `GET /api/documents/owned` - Get owned documents (protected)
- `GET /api/documents/shared` - Get shared documents (protected)
- `GET /api/documents/trash` - Get trashed documents (protected)
- `GET /api/document/:id` - Get single document (protected)
- `PUT /api/document/:id` - Update document (protected)
- `DELETE /api/document/:id` - Move document to trash (protected)
- `DELETE /api/document/:id/delete` - Permanently delete document (protected)
- `PUT /api/document/:id/restore` - Restore from trash (protected)

### Sharing
- `POST /api/document/:id/share` - Share document with user (protected)
- `DELETE /api/document/:id/share/:shareUserId` - Remove sharing (protected)
- `PUT /api/document/:id/public` - Toggle public visibility (protected)

### Document Locking
- `PUT /api/document/:id/lock` - Lock document for editing (protected)
- `PUT /api/document/:id/unlock` - Unlock document (protected)

### Public Access
- `GET /api/public/document/:id` - View public document (no auth required)

## Project Structure

```
Project/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Document.tsx
│   │   │   └── PublicDocument.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── server/                  # Express backend
│   ├── src/
│   │   ├── middleware/     # Custom middleware
│   │   │   ├── validateToken.ts
│   │   │   └── multer-config.ts
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.ts
│   │   │   └── UserDocument.ts
│   │   └── routes/         # API routes
│   │       └── index.ts
│   ├── app.ts              # Express app configuration
│   ├── package.json
│   └── tsconfig.json
└── package.json            # Root package.json
```

## Database Schema

### User
- `email`: String (required, unique)
- `password`: String (required, hashed)

### UserDocument
- `name`: String (required)
- `text`: String (required)
- `user`: ObjectId (required, reference to User)
- `sharedEditWith`: Array of ObjectIds
- `sharedViewWith`: Array of ObjectIds
- `isPublic`: Boolean (default: false)
- `isLocked`: Boolean (default: false)
- `isTrashed`: Boolean (default: false)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## Security Features

- Password hashing using bcrypt with salt rounds
- JWT token-based authentication
- Token expiration (1 hour)
- Protected API routes with token validation
- CORS configuration restricting origins
- Permission-based document access control

## Usage

1. **Register an Account**: Navigate to `/register` and create a new account
2. **Login**: Use your credentials at `/login`
3. **Create Documents**: Click "New Document" on the documents page
4. **Share Documents**: Open a document and use the share feature to grant access to other users
5. **Make Public**: Toggle the public switch to generate a shareable public link
6. **Export to PDF**: Click the export button to download a document as PDF
7. **Trash Documents**: Delete unwanted documents; they can be restored from trash
8. **View Shared**: Check the "Shared with Me" section to see documents others have shared

## Development Scripts

```bash
npm run dev:client      # Start client development server
npm run dev:server      # Start server development server
npm run build           # Build client for production
npm install             # Install all dependencies
```

## Author

Developed as an Advanced Web Applications project.
