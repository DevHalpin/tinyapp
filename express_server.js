const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
const PORT = 8080; //default HTTP port 

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = () => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.get('/', (req,res) => {
  res.send('Hello!')
});

app.get('/urls', (req,res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]
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
  res.render('urls_new')
})

app.get('/u/:shortURL', (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.get('/urls/:shortURL', (req,res) => {
    let templateVars = { 
      username: req.cookies["username"],
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

app.post("/login", (req,res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});