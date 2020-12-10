//Helper Functions
function generateRandomString() {          //Generates a 6-digit random string
  return Math.random().toString(36).substring(2, 8);
};
function checkIfUserExists(users, email) { //Returns a user's unique ID if the email was found
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return undefined;
};
function urlsForUser(id) {

};
//Server Setup
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "z3812s"}
};
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purplemonkey"
  },
  "z3812s": {
    id: "z3812s",
    email: "abc@123.com",
    password: "helloworld"
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
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {              //CREATE a new shortURL:LongURL
  const templateVars = { user: users[req.cookies["user_id"]] };
  
  res.render((templateVars.user ? "urls_new" : "login"), templateVars);
});

app.get("/urls/:shortURL", (req,res) => {         //READ the shortURL:LongURL key/value pair
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {           //Redirect requests to the actual long URL
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req,res) => {               //Once registration is successful, user is  automatically logged in
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("registration", templateVars);
});

app.get("/login", (req,res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render((templateVars.user ? "urls_index" : "login"), templateVars); //if a logged in user tries to access a login page, send them back to urls
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
//TO-DO: fix redirections to make more sense
app.post("/login", (req,res) => {
  let user = checkIfUserExists(users, req.body.email); //will be either undefined or the unique ID
  if(user) {
    if(req.body.password === users[user].password) {
      res.cookie("user_id", user);
      res.redirect("/urls");
    }
    else {
      res.statusCode = 403;
      res.end()
    }
  }
  else {
    res.statusCode = 403;
    res.end()
  }
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