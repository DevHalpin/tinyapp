const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = 8080; //default HTTP port

app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserObjectFromId = (usernameId) => {
  for (const id in users) {
    if (id === usernameId) {
      return users[id];
    }
  }
};

const urlsForUser = (id) => {
  const database = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      database[url] = urlDatabase[url];
    }
  }
  return database;
};

const getUserObjectFromEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = {
      urls: urlsForUser(req.cookies["user_id"]),
      user: getUserObjectFromId(req.cookies["user_id"])
    };
    res.render('urls_index', templateVars);
  }
  return res.status(401).redirect("/login");
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  if (req.cookies["user_id"]) {
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: getUserObjectFromId(req.cookies["user_id"])
  };
  if (templateVars.user) {
    return res.render('urls_new', templateVars);
  }
  return res.redirect("/login");
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:shortURL/', (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    return res.redirect('/urls');
  }
  return res.status(403).send("Incorrect userID for this shortURL!");
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: getUserObjectFromId(req.cookies["user_id"]),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    return res.render('urls_show', templateVars);
  }
  res.redirect("/login");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  return res.status(403).send("Incorrect userID for this shortURL");
});


app.get("/login", (req, res) => {
  const templateVars = {
    user: getUserObjectFromId(req.cookies["user_id"])
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserObjectFromEmail(req.body.email);
  if (!user) {
    return res.status(403).send("Issue with email/password combination!");
  }
  if (user.password !== req.body.password) {
    return res.status(403).send("Issue with email/password combination!");
  }
  res.cookie("user_id", user.id);
  return res.redirect("urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: getUserObjectFromId(req.cookies["user_id"])
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.status(400).send("Empty password and/or email!");
    return;
  }
  if (getUserObjectFromEmail(email)) {
    res.status(400).send("Email already exists in database!");
    return;
  }
  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});