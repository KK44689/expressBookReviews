const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let filtered_user = users.find(user => user.username === username);
  if (filtered_user) return true;
  return false;
}

const authenticatedUser = (username, password) => {
  let filtered_user = users.find(user => user.username === username && user.password === password);

  if (filtered_user) return true;
  return false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) return res.status(404).json({ message: "Error logging in" });

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    res.status(200).json({ message: `User ${username} successfully logged in` });
  } else {
    res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const review = req.body.review;

  let book = books[isbn];

  if (!isValid(username)) return res.status(403).json({ message: `User ${username} not authenticated` });

  if (!book) return res.status(404).json({ message: `Book with ISBN: ${isbn} not found.` });

  if (!username || !review) return res.status(403).json({ message: "Username or review can't be empty." });

  book.reviews[username] = review;
  res.status(200).json({ message: `The review for the book with ISBN: ${isbn} has been added/updated.` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  let book = books[isbn];

  if (!isValid(username)) return res.status(403).json({ message: `User ${username} not authenticated` });
  if (!book) return res.status(404).json({ message: `Book with ISBN: ${isbn} not found.` });
  if (!book.reviews[username]) return res.status(404).json({ message: `Review by user: ${username} for book with ISBN: ${isbn} not found.` });

  delete book.reviews[username];
  res.status(200).json({ message: `Review by user: ${username} for book with ISBN: ${isbn} has been deleted.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
