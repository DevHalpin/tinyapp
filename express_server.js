const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {getUserObjectFromEmail , getUserObjectFromId, generateRandomString, urlsForUser} = require('./helpers');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['thisisastring']
}));
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

app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: getUserObjectFromId(req.session.user, users)
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserObjectFromEmail(req.body.email, users);
  if (!user) {
    return res.status(401).send("Issue with email/password combination!");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).send("Issue with email/password combination!");
  }
  req.session.user = user.id;
  return res.redirect("urls");
});

app.post("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: getUserObjectFromId(req.session.user, users)
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.status(400).send("Empty password and/or email!");
    return;
  }
  if (getUserObjectFromEmail(email, users)) {
    res.status(400).send("Email already exists in database!");
    return;
  }
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  req.session.user = id;
  res.redirect("/urls");
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  if (req.session.user) {
    const templateVars = {
      urls: urlsForUser(req.session.user, urlDatabase),
      user: getUserObjectFromId(req.session.user, users)
    };
    return res.render('urls_index', templateVars);
  }
  return res.status(401).send('Please log in to view shortURLs!');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  if (req.session.user) {
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: getUserObjectFromId(req.session.user, users)
  };
  if (templateVars.user) {
    return res.render('urls_new', templateVars);
  }
  return res.redirect("/login");
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Invalid shortURL");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});

app.post('/urls/:shortURL/', (req, res) => {
  if (req.session.user === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    return res.redirect('/urls');
  } else if (req.session.user) {
    return res.status(403).send("Invalid userID for this shortURL!");
  } else {
    return res.status(401).send('Please log in to view shortURLs!');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Invalid shortURL");
  }
  const templateVars = {
    user: getUserObjectFromId(req.session.user, users),
    shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  if (req.session.user === urlDatabase[req.params.shortURL].userID) {
    return res.render('urls_show', templateVars);
  } else if (req.session.user) {
    return res.status(403).send('Invalid UserID for this shortURL!');
  }
  return res.status(401).send('Please log in to view shortURLs!');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  } else if (req.session.user) {
    return res.status(403).send('Invalid UserID for this shortURL!');
  }
  return res.status(401).send('Please log in to view shortURLs!');
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