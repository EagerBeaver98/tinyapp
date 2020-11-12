const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcrypt");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = { longURL: req.body.longURL, userID: users[req.cookies["userID"]].id };
  const keys = Object.keys(urlDatabase);
  const key = keys[keys.length - 1];
  console.log(urlDatabase);
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

const generateUserID = () => {
  return Math.random().toString(36).substr(2, 5);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

const urlsForUser = (id) => {
  const temp = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      temp[URL] = urlDatabase[URL];
    }
  }
  return temp;
};

app.get("/urls", (req, res) => {
  const userURLs = urlsForUser(req.cookies["userID"]);
  const templateVars = {
    urls: userURLs,
    userID: users[req.cookies["userID"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const keys = Object.keys(users);
  for (const key of keys) {
    if (users[key].id === req.cookies["userID"]) {
      const templateVars = { userID: users[req.cookies["userID"]],
      };
      res.render("urls_new", templateVars);
      return;
    }
  }
  return res.redirect("/urls");
  
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["userID"] !== urlDatabase[req.params.shortURL].userID) {
    return res.redirect("/url");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: users[req.cookies["userID"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL].longURL);
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
  if (req.cookies["userID"] !== urlDatabase[req.params.shortURL].userID) {
    return res.redirect("/url");
  }
  delete urlDatabase[req.params.shortURL];
  console.log(`${req.params.shortURL} deleted.`);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const id = Object.keys(users);
  for (const idNum of id) {
    if (users[idNum].email === req.body["email"] && bcrypt.compareSync(req.body["password"], users[idNum].password)) {
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
  console.log(`${urlDatabase[shortURL].longURL} replaced by:`);
  urlDatabase[shortURL].longURL = req.body.url;
  console.log(urlDatabase[shortURL].longURL);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
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
  console.log(users);
  res.cookie("userID", newID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port: ${PORT}`);
});