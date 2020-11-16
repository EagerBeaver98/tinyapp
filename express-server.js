const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const { getUserByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'userID',
  keys: ['keyOne', 'keyTwo'],
}));
app.use(morgan('dev'));
app.use(cookieParser());

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

app.post("/urls", (req, res) => { //creates new shortened url
  const key = generateRandomString();
  urlDatabase[key] = { longURL: req.body.longURL, userID: users[req.session.userID].id };
  res.redirect(`/urls/${key}`);
});

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "meeeee" },
  tsm5xK: { longURL: "http://www.google.com", userID: "meeeee" },
};

const users = {
  "randomUserID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "password",
  },
  "meeeee": {
    id: "meeeee",
    email: "iam@email.com",
    password: "password",
  }
};

const generateUserID = () => { //generates userID identifier
  return Math.random().toString(36).substr(2, 5);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

const urlsForUser = (id) => { //compares id param to urlDatabase and returns object with urls assigned that ID
  const temp = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      temp[URL] = urlDatabase[URL];
    }
  }
  return temp;
};

app.get("/urls", (req, res) => {
  const userURLs = urlsForUser(req.session.userID);
  const templateVars = {
    urls: userURLs,
    userID: users[req.session.userID],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { //creates new URL and assigns userID to URL object
  const keysOfUsers = Object.keys(users);
  for (const key of keysOfUsers) {
    if (users[key].id === req.session.userID) {
      const templateVars = { userID: users[req.session.userID],
      };
      res.render("urls_new", templateVars);
      return;
    }
  }
  res.status(401);
  return res.redirect("/urls");
  
});

app.get("/urls/:shortURL", (req, res) => { //shows shortened url page, only viewable by owner
  if (users[req.session.userID] === undefined || users[req.session.userID].id !== urlDatabase[req.params.shortURL].userID) {
    res.status(401);
    return res.send('Unauthorized to access this page.');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: users[req.session.userID],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { //redirects to long url
  if (users[req.session.userID] === undefined || users[req.session.userID].id !== urlDatabase[req.params.shortURL].userID) {
    res.status(401);
    return res.send("Unauthorized to acces this page.");
  }
  res.redirect(`${urlDatabase[req.params.shortURL].longURL}`);
});

app.get("/urls.json", (req, res) => { //return JSON file of urlDatabase
  res.json(urlDatabase);
});

app.get("/register", (req, res) => { //creates a new user
  const templateVars = { userID: users[req.session.userID],
  };
  res.render("urls_register", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  const templateVars = { userID: users[req.session.userID],
  };
  res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => { //removes url from database, only accessible by userID
  if (users[req.session.userID] === undefined || req.session.userID !== urlDatabase[req.params.shortURL].userID) {
    return res.redirect("/url");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const keysOfUsers = Object.keys(users);
  for (const idNum of keysOfUsers) {
    if (users[idNum].email === req.body["email"] && bcrypt.compareSync(req.body["password"], users[idNum].password)) {
      req.session.userID = idNum;
      return res.redirect('/urls');
    }
  }
  res.status(404);
  res.send("Login failed. Ensure email address and password are correct.");
  return;
});

app.post("/urls/:shortURL", (req, res) => { //edits exsisting urls
  if (users[req.session.userID] === undefined || req.session.userID !== urlDatabase[req.params.shortURL].userID) {
    res.status(401);
    return res.render("Unauthorized user");
  }
  const shortURL = req.params.shortURL.replace(":");
  urlDatabase[shortURL].longURL = req.body.url;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  if (!req.body["email"] || !req.body["password"]) {
    res.status(400);
    res.send("email or password incorrect");
  }
  const newID = generateUserID();
  users[newID] = {
    id: newID,
    email: req.body["email"],
    password: bcrypt.hashSync(req.body["password"], 7)
  };
  req.session.userID = newID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port: ${PORT}`);
});