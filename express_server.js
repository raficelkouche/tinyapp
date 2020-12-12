//Server Setup
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const {generateRandomString, getUserByEmail, getURLsForUser} = require("./helper");

const saltRounds = 10;
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

//Objects to test the server
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW", totalVisits: 0 },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", totalVisits: 0 },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "z3812s", totalVisits: 0},
  "5sev6w": { longURL: "http://www.kfc.ca", userID: "z3812s", totalVisits: 0}
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

//Routing
app.get("/", (req,res) => {
  req.session = null;
  res.render("home");
});

app.get("/urls.json", (req,res) => {
  res.json(users);
});

app.get("/urls", (req,res) => {
  const userID = req.session.userID;
  const templateVars = {urls: getURLsForUser(urlDatabase, userID), user: users[userID], error: "not logged in"};
  res.render((userID ? "urls_index" : "error"), templateVars);
});

app.get("/urls/new", (req, res) => {              //Display a form to create a new URL
  const templateVars = { user: users[req.session.userID] };
  
  res.render((templateVars.user ? "urls_new" : "login"), templateVars);
});

app.get("/urls/:shortURL", (req,res) => {         //READ the shortURL:LongURL key/value pair
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.render("error", {user: users[userID], error: "resource not found"});
  } else if (urlDatabase[shortURL].userID === userID) { //check if the URL belongs to the user
    const templateVars = { shortURL: shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID], totalVisits: urlDatabase[shortURL].totalVisits };
    res.render("urls_show", templateVars);
  } else {
    res.statusCode = "403";
    res.render("error", {user: users[userID], error: "access denied"});
  }
});

app.get("/u/:shortURL", (req, res) => {           //Redirect requests to the actual long URL
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL].totalVisits++;
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.render("error", {error: "resource not found", user: users[req.session.userID]});
  }
});

app.get("/register", (req,res) => {               //Once registration is successful, user is  automatically logged in
  const userID = req.session.userID;
  const templateVars = { urls: getURLsForUser(urlDatabase, userID), user: users[userID]};
  res.render((templateVars.user ? "urls_index" : "registration"), templateVars); //if a logged in user tries to access the registration page, send them back to urls
});


app.get("/login", (req,res) => {
  const userID = req.session.userID;
  const templateVars = { urls: getURLsForUser(urlDatabase, userID), user: users[userID]};
  res.render((templateVars.user ? "urls_index" : "login"), templateVars); //if a logged in user tries to access the login page, send them back to urls
});

app.post("/urls", (req, res) => {                 //CREATE a new shortURL:LongURL
  const userID = req.session.userID;
  if (userID) {
    const key = generateRandomString();
    urlDatabase[key] = {};
    urlDatabase[key].longURL = req.body.longURL;
    urlDatabase[key].userID = userID;
    res.redirect(`/urls/${key}`);
  } else {
    res.statusCode = "403";
    res.end();
  }
});

app.delete("/urls/:shortURL/delete", (req,res) => { //DELETE a shortURL and its corresponding longURL
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  
  if (urlDatabase[shortURL].userID === userID) { //check if the URL belongs to the user
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.statusCode = "403";
    res.render("error", { user: users[userID], error: "access denied" });
  }
});

app.put("/urls/:id", (req,res) => {              //UPDATE the longURL for an existing shortURL
  const userID = req.session.userID;
  const shortURL = req.params.id;
  const longURL = req.body.longURL;

  if (urlDatabase[shortURL].userID === userID) {
    urlDatabase[req.params.id].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.statusCode = "403";
    res.end();
  }
});

app.post("/login", (req,res) => {
  let user = getUserByEmail(users, req.body.email); //will be either undefined or the unique ID
  if (user) {
    if (bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.userID = user;
      res.redirect("/urls");
    } else {
      res.statusCode = 403;
      res.render("error", {user: undefined, error: "login failed"});
    }
  } else {
    res.statusCode = 403;
    res.render("error", { user: undefined, error: "login failed" });
  }
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/");
});

app.post("/register", (req,res) => {                           //create an account and check for validity
  if (getUserByEmail(users,req.body.email)) {
    res.statusCode = "400";
    res.render("error", { user: undefined, error: "registration failed" });
  } else if (!req.body.email || !req.body.password) {
    res.statusCode = "400";
    res.render("error", { user: undefined, error: "registration failed" });
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
    req.session.userID = userID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});
