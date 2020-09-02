const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { request } = require('express');
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
const PORT = 8080; //default HTTP port 

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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
}

const generateRandomString = () => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const getUserObjectFromId = (usernameId) => {
  for (id in users) {
    if (id === usernameId) {
      return users[id]; 
    }
  }
}

const getUserObjectFromEmail = (email) => {
  for (id in users) {
    if (users[id].email === email) {
      return users[id]; 
    }
  }
  return null;
}

app.get('/', (req,res) => {
  res.send('Hello!')
});

app.get('/urls', (req,res) => {
  let templateVars = { 
    urls: urlDatabase, 
    user: getUserObjectFromId(req.cookies["user_id"])
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req,res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
})

app.post('/urls/:shortURL/', (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL
  res.redirect('/urls')
})

app.get('/urls/new', (req,res) => {
  let templateVars = { 
    user: getUserObjectFromId(req.cookies["user_id"])
  };
  res.render('urls_new', templateVars)
})

app.get('/u/:shortURL', (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.get('/urls/:shortURL', (req,res) => {
    let templateVars = { 
      user: getUserObjectFromId(req.cookies["user_id"]),
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]
    };
    res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
})

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req,res) => {
  let templateVars = { 
    user: getUserObjectFromId(req.cookies["user_id"])
  };
  res.render("login", templateVars)
})

app.post("/login", (req,res) => {
  const user = getUserObjectFromEmail(req.body.email);
  if (!user) {
    console.log('Email does not exist!')
    return res.status(403).send("Issue with email/password combination!")
  }
  if (user.password !== req.body.email) {
    console.log('Password is incorrect!')
    return res.status(403).send("Issue with email/password combination!")
  }
  res.cookie("user_id", users[user].id);
  return res.redirect("urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  let templateVars = { 
    user: getUserObjectFromId(req.cookies["user_id"])
  };
  res.render("register", templateVars)
})

app.post("/register", (req,res) => {
  id = generateRandomString();
  const email = req.body.email
  const password = req.body.password
  if (email === '' || password === '') {
    res.status(400).send("Empty password and/or email!");
    console.log("Found either empty email or password");
    return;
  }
  if (getUserObjectFromEmail(email)) {
    res.status(400).send("Email already exists in database!")
    console.log('Email already exists in database!')
    return;
  }
  users[id] = {
    id,
    email,
    password
  }
  res.cookie("user_id",id);
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});