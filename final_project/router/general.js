const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.get("/users", (req, res) => {
  res.send(users);
});

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) res.status(403).json({ message: "Username or Password can't be empty." });

  let user = users.find(user => user.username == username);
  if (user) res.status(403).json({ message: "User already existed." });
  else {
    users.push({ username: username, password: password });
    res.status(200).json({message: `User: ${username} is added.`});
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books), null, 4);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  let filtered_book = books[isbn];

  if (filtered_book) res.send(JSON.stringify(filtered_book, null, 4));
  else res.status(404).json({ message: `Book with ISBN: ${isbn} not found.` });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  let filtered_book = [];
  Object.keys(books).forEach(key => {
    if (books[key].author.toLowerCase().includes(author))
      filtered_book.push(books[key]);
  });

  if (filtered_book.length > 0) {
    res.send(JSON.stringify(filtered_book, null, 4));
  } else {
    res.status(404).json({ message: `Book with author name: ${author} not found.` });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();

  let filtered_book = [];
  Object.values(books).forEach(book => {
    if (book.title.toLowerCase().includes(title))
      filtered_book.push(book);
  });

  if (filtered_book.length > 0) res.send(JSON.stringify(filtered_book, null, 4));
  else res.status(404).json({ message: `Book with title: ${title} not found.` });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  let filtered_book = books[isbn];
  if (filtered_book) res.send(JSON.stringify(filtered_book.reviews), null, 4);
  else res.status(404).json({ message: `Book with ISBN: ${isbn} not found.` });
});

module.exports.general = public_users;
