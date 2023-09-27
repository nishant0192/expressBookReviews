// In auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");

const createAuthRouter = (session) => {
  const authenticatedRouter = express.Router();
  let registeredUsers = [];

  const isValidUser = (username, password) => {
    // Implement your own logic to check if the username and password are valid
    // For the sake of example, we're using a simple equality check
    return registeredUsers.some(user => user.username === username && user.password === password);
  };

  const isAuthenticated = (req, res, next) => {
    if (!req.session.token) {
      return res.status(401).json({ message: "Unauthorized. Please log in" });
    }

    jwt.verify(req.session.token, 'your_secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized. Invalid token" });
      }

      req.authUsername = decoded.username;
      next();
    });
  };

  authenticatedRouter.use(express.json());

  authenticatedRouter.use(session({
    secret: "your_session_secret", // Replace with a secure session secret
    resave: true,
    saveUninitialized: true
  }));

  authenticatedRouter.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValidUser(username, password)) {
      return res.status(409).json({ message: "Username already exists" });
    }

    registeredUsers.push({ username, password });
    res.status(201).json({ message: "Registration successful" });
  });

  authenticatedRouter.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValidUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, 'your_secret_key');
    req.session.token = token;

    res.status(200).json({ message: "Login successful", token });
  });

  authenticatedRouter.put("/auth/review/:isbn", isAuthenticated, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user already left a review for this book
    if (!book.reviews) {
      book.reviews = {};
    }

    if (book.reviews[req.authUsername]) {
      // If the user already left a review, update it
      book.reviews[req.authUsername] = review;
      res.status(200).json({ message: "Review updated successfully" });
    } else {
      // If it's a new review, add it
      book.reviews[req.authUsername] = review;
      res.status(201).json({ message: "Review added successfully" });
    }
  });

  authenticatedRouter.delete("/auth/review/:isbn", isAuthenticated, (req, res) => {
    const { isbn } = req.params;
    const book = books[isbn];

    if (!book || !book.reviews || !book.reviews[req.authUsername]) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review
    delete book.reviews[req.authUsername];
    res.status(200).json({ message: "Review deleted successfully" });
  });

  return authenticatedRouter;
};

module.exports = createAuthRouter;
