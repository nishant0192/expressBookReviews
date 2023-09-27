const express = require("express");
const axios = require("axios");
const books = require("./booksdb.js");
const isValid = require("./auth_users.js").isValid;
const users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username is already taken
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Create a new user
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

// public_users.get("/", function (req, res) {
//   const bookList = Object.values(books);
//   return res.status(200).json(bookList);
// });

public_users.get("/books-async", async function (req, res) {
  // Assuming booksdb.js exports the books data directly
  const books = require("./booksdb.js");

  try {
    // Simulate fetching books (replace with your actual logic)
    const bookList = Object.values(books);
    //   const bookList = Object.values(books);
    //   return res.status(200).json(bookList);
    res.json(bookList);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

public_users.get("/isbn-promise/:isbn", function (req, res) {
  const { isbn } = req.params;
  const books = require("./booksdb.js");

  // Simulate an asynchronous operation with a Promise
  const fetchBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      try {
        // Simulate fetching book details based on ISBN (replace with your actual logic)
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error("Book not found"));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Using Promise callbacks
  fetchBookByISBN(isbn)
    .then((book) => res.json(book))
    .catch((error) => {
      console.error("Error fetching book details by ISBN:", error.message);
      res.status(404).json({ error: "Book not found" });
    });
});

public_users.get("/author-promise/:author", function (req, res) {
  const { author } = req.params;
  const books = require("./booksdb.js");

  // Simulate an asynchronous operation with a Promise
  const fetchBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      try {
        // Simulate fetching book details based on Author (replace with your actual logic)
        const booksByAuthor = Object.values(books).filter(
          (book) => book.author === author
        );
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject(new Error("No books found by this author"));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Using Promise callbacks
  fetchBooksByAuthor(author)
    .then((books) => res.json(books))
    .catch((error) => {
      console.error("Error fetching books by author:", error.message);
      res.status(404).json({ error: "No books found by this author" });
    });
});

// In general.js
public_users.get("/title-promise/:title", function (req, res) {
  const { title } = req.params;
  const books = require("./booksdb.js");

  // Simulate an asynchronous operation with a Promise
  const fetchBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      try {
        // Simulate fetching book details based on Title (replace with your actual logic)
        const booksByTitle = Object.values(books).filter((book) =>
          book.title.includes(title)
        );
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject(new Error("No books found with this title"));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Using Promise callbacks
  fetchBooksByTitle(title)
    .then((books) => res.json(books))
    .catch((error) => {
      console.error("Error fetching books by title:", error.message);
      res.status(404).json({ error: "No books found with this title" });
    });
});

public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviews = book.reviews;
  return res.status(200).json(reviews);
});

module.exports.general = public_users;
