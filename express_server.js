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
function urlsForUser(id) {                //Returns an object that contains the URLs for a given user
  const filteredURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredURLs[key] = urlDatabase[key];
    }
  }
  return filteredURLs;
};

//Server Setup
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const PORT = 8080;

//Objects to test the server
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "z3812s"}
};
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purplemonkey",saltRounds)
  },
  "z3812s": {
    id: "z3812s",
    email: "abc@123.com",
    password: bcrypt.hashSync("helloworld", saltRounds)
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
  const user_id = req.cookies["user_id"];
  const templateVars = {urls: urlsForUser(user_id), user: users[user_id], error: "not logged in"};
  res.render((user_id ? "urls_index" : "error"), templateVars);
});

app.get("/urls/new", (req, res) => {              //Display a form to create a new URL
  const templateVars = { user: users[req.cookies["user_id"]] };
  
  res.render((templateVars.user ? "urls_new" : "login"), templateVars);
});

app.get("/urls/:shortURL", (req,res) => {         //READ the shortURL:LongURL key/value pair
  const user_id = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.render("error", {user: users[user_id], error: "resource not found"})
  }
  else if (urlDatabase[shortURL].userID === user_id) { //check if the URL belongs to the user
    const templateVars = { shortURL: shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[user_id] };
    res.render("urls_show", templateVars);
  }
  else {
    res.statusCode = "403";
    res.render("error", {user: users[user_id], error: "access denied"});
  }
});

app.get("/u/:shortURL", (req, res) => {           //Redirect requests to the actual long URL
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req,res) => {               //Once registration is successful, user is  automatically logged in
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("registration", templateVars);
});

app.get("/login", (req,res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlsForUser(user_id), user: users[user_id]};
  res.render((templateVars.user ? "urls_index" : "login"), templateVars); //if a logged in user tries to access a login page, send them back to urls
});

app.post("/urls", (req, res) => {                 //CREATE a new shortURL:LongURL
  const user_id = req.cookies["user_id"];
  if (user_id) {
    const key = generateRandomString();
    urlDatabase[key] = {};
    urlDatabase[key].longURL = req.body.longURL;
    urlDatabase[key].userID = user_id;
    res.redirect(`/urls/${key}`);
    console.log(urlDatabase);
  }
  else {
    res.statusCode = "403";
    res.end();
  }
});

app.post("/urls/:shortURL/delete", (req,res) => { //DELETE a shortURL and its corresponding longURL
  const user_id = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  
  if (urlDatabase[shortURL].userID === user_id) { //check if the URL belongs to the user
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  else {
    res.statusCode = "403";
    res.render("error", { user: users[user_id], error: "access denied" });
  }
});

app.post("/urls/:id", (req,res) => {              //UPDATE the longURL for an existing shortURL
  const user_id = req.cookies["user_id"];
  const shortURL = req.params.id;
  const longURL = req.body.longURL;

  if (urlDatabase[shortURL].userID === user_id) {
    urlDatabase[req.params.id].longURL = longURL;
    res.redirect("/urls");
  }
  else {
    res.statusCode = "403";
    res.end();
  }
});

app.post("/login", (req,res) => {
  let user = checkIfUserExists(users, req.body.email); //will be either undefined or the unique ID
  if(user) {
    if(bcrypt.compareSync(req.body.password, users[user].password)) {
      res.cookie("user_id", user);
      res.redirect("/urls");
    }
    else {
      res.statusCode = 403;
      res.render("error", {user: undefined, error: "login failed"});
    }
  }
  else {
    res.statusCode = 403;
    res.render("error", { user: undefined, error: "login failed" });
  }
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req,res) => {                                        //create a new valid account
  if (checkIfUserExists(users,req.body.email)) {
    res.statusCode = "400";
    res.render("error", { user: undefined, error: "registration failed" })
  }
  else if (!req.body.email || !req.body.password) {
    res.statusCode = "400";
    res.render("error", { user: undefined, error: "registration failed" })
  }
  else {
    const user_id = generateRandomString();
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
  res.cookie('user_id', user_id);
  res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});
