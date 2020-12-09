function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
  console.log(req.cookies)
});

app.get("/urls/new", (req, res) => {              //CREATE a new shortURL:LongURL
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req,res) => {         //READ the shortURL:LongURL key/value pair
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {           //Redirect requests to the actual long URL
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/register", (req,res) => {
  const templateVars = {username: req.cookies["username"]};
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
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/register", (req,res) => {
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users);
  res.cookie('user_id', user_id);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});