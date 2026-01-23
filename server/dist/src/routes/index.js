"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateToken_1 = require("../middleware/validateToken");
const Book_1 = require("../models/Book");
//import upload from "../middleware/multer-config"
const router = (0, express_1.Router)();
const userList = [];
router.post("/book", async (req, res) => {
    const { name, author, pages } = req.body;
    const newBook = new Book_1.Book({
        name,
        author,
        pages
    });
    await newBook.save();
    res.status(201).json(newBook);
});
router.get("/book/:name", async (req, res) => {
    const { name } = req.params;
    const book = await Book_1.Book.findOne({ name: name });
    if (book) {
        res.status(200).json(book);
    }
    else {
        res.status(404);
    }
});
router.post("/api/user/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userExist = userList.find(user => user.email === email);
    if (userExist) {
        return res.status(403).json({ error: "User with the same email exists" });
    }
    const salt = bcrypt_1.default.genSaltSync(10);
    const hash = bcrypt_1.default.hashSync(password, salt);
    const newUser = {
        email: email,
        password: hash
    };
    userList.push(newUser);
    res.status(200).json(newUser);
});
router.get("/api/user/list", (req, res) => {
    res.status(200).json(userList);
});
router.post("/api/user/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = userList.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
    }
    if (bcrypt_1.default.compareSync(password, user.password)) {
        const jwtPayload = {
            email: user.email
        };
        const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: "10m" });
        return res.status(200).json({ success: true, token: token });
    }
    return res.status(401).json({ success: false, message: "Login failed" });
});
router.get("/api/private", validateToken_1.validateToken, (req, res) => {
    res.status(200).json({ message: "This is protected secure route!" });
});
exports.default = router;
