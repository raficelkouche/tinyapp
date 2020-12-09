function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
function checkIfUserExists(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}
//Server Setup
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "z3812s": {
    id: "z3812s",
    email: "abc@123.com",
    password: "helloworldd"
  }
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//Routing
app.get("/", (req,res) => {
  res.send("hello");
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {              //CREATE a new shortURL:LongURL
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req,res) => {         //READ the shortURL:LongURL key/value pair
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {           //Redirect requests to the actual long URL
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/register", (req,res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("registration", templateVars);
});

app.post("/urls", (req,res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:shortURL/delete", (req,res) => { //DELETE a shortURL and its corresponding longURL
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req,res) => {              //UPDATE the longURL for an existing shortURL
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req,res) => {
  if (checkIfUserExists(users,req.body.email)) {
    res.statusCode = "400";
    res.end();
  }
  else if (!req.body.email || !req.body.password) {
    res.statusCode = "400";
    res.end();
  }
  else {
    const user_id = generateRandomString();
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: req.body.password
    };
  res.cookie('user_id', user_id);
  res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});