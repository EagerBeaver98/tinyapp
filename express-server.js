const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  urlDatabase[generateRandomString()] = req.body.longURL;
  // Respond with 'Ok' (we will replace this)
  const keys = Object.keys(urlDatabase);
  const key = keys[keys.length - 1];
  res.redirect(`/urls/${key}`);
});

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

const generateUserID = () => {
  return Math.random().toString(36).substr(2, 6);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: users[req.cookies["userID"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { userID: req.cookies["userID"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL], userID: req.cookies["userID"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = { userID: req.cookies["userID"],
  };
  res.render("urls_register", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  const templateVars = { userID: req.cookies["userID"],
  };
  res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`Request to delete URL ${req.params.shortURL}`);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const id = Object.keys(users);
  for (const idNum of id) {
    if (users[idNum].email === req.body["email"] && users[idNum].password === req.body["password"]) {
      res.cookie("userID", users[idNum].id);
      return res.redirect('/urls');
    }
  }
  res.status(404);
  res.send("Login failed. Ensure email address and password are correct.");
  return;
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL.replace(":");
  console.log(`${urlDatabase[shortURL]} replaced by:`);
  urlDatabase[shortURL] = req.body.url;
  console.log(urlDatabase[shortURL]);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const newID = generateUserID();
  if (!req.body["email"] || !req.body["password"]) {
    res.status(400);
    res.send("email or password incorrect");
  }
  users[newID] = {
    id: newID,
    email: req.body["email"],
    password: req.body["password"]
  };
  
  res.cookie("userID", newID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port: ${PORT}`);
});