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
const urlDatabase = { //visitLog will hold arrays that contain vistorID and timestamp of visit
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    dateCreated: "October 19, 2020",
    totalVisits: 0,
    uniqueVisits: 0,
    visitLog: []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    dateCreated: "December 10, 2020",
    totalVisits: 0,
    uniqueVisits: 0,
    visitLog: []
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "z3812s",
    dateCreated: "November 3, 2020",
    totalVisits: 0,
    uniqueVisits: 0,
    visitLog: []
  },
  "5sev6w": {
    longURL: "http://www.kfc.ca",
    userID: "z3812s",
    dateCreated: "November 13, 2020",
    totalVisits: 0,
    uniqueVisits: 0,
    visitLog: []
  }
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
  //If the user is logged in, homepage = urls_index
  (req.session.userID) ? res.redirect("/urls") : res.render("home");
});

app.get("/urls.json", (req,res) => {
  res.json(users);
});

app.get("/urls", (req,res) => {
  const userID = req.session.userID;

  const templateVars = {
    urls: getURLsForUser(urlDatabase, userID),
    user: users[userID],
    error: "not logged in"};

  res.render((userID ? "urls_index" : "error"), templateVars);
});
//Display a form to create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.userID] };
  res.render((templateVars.user ? "urls_new" : "login"), templateVars);
});

//READ the shortURL:LongURL key/value pair
app.get("/urls/:shortURL", (req,res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.render("error", {user: users[userID], error: "resource not found"});
    //check if the URL belongs to the user
  } else if (urlDatabase[shortURL].userID === userID) {
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[userID],
      totalVisits: urlDatabase[shortURL].totalVisits,
      uniqueVisits: urlDatabase[shortURL].uniqueVisits,
      visitLog: urlDatabase[shortURL].visitLog
    };
    res.render("urls_show", templateVars);
  } else {
    res.statusCode = "403";
    res.render("error", {user: users[userID], error: "access denied"});
  }
});

//Redirect requests to the actual long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    //generate Visitor ID only for unique visitors
    if (!req.session.visitorID) {
      req.session.visitorID = generateRandomString();
    }

    //count the visits
    let i = 0;
    urlDatabase[shortURL].totalVisits++;
    urlDatabase[shortURL].uniqueVisits++;
    //before adding the visitor to the log, check if they exist, if they do, decrement unique visitors
    while (i < urlDatabase[shortURL].visitLog.length) {
      if (urlDatabase[shortURL].visitLog[i][0] === req.session.visitorID) {
        urlDatabase[shortURL].uniqueVisits--;
      }
      i++;
    }

    //update the visit log with the visitor ID and timestamp
    const date = new Date(Date.now() - 18000000);  //The 18000000 is to convert time from GMT to EST
    const timestamp = [req.session.visitorID, `${date.toUTCString()}-5`];
    urlDatabase[shortURL].visitLog.push(timestamp);

    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.render("error", {error: "resource not found", user: users[req.session.userID]});
  }
});

//Once registration is successful, user is  automatically logged in
app.get("/register", (req,res) => {
  const userID = req.session.userID;
  const templateVars = { urls: getURLsForUser(urlDatabase, userID), user: users[userID]};
  res.render((templateVars.user ? "urls_index" : "registration"), templateVars); //if a logged in user tries to access the registration page, send them back to urls
});

app.get("/login", (req,res) => {
  const userID = req.session.userID;
  const templateVars = { urls: getURLsForUser(urlDatabase, userID), user: users[userID]};
  //if a logged in user tries to access the login page, send them back to urls
  res.render((templateVars.user ? "urls_index" : "login"), templateVars);
});

//CREATE a new shortURL:LongURL
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    const key = generateRandomString();
    //Create a new entry in the database
    urlDatabase[key] = {};
    urlDatabase[key].longURL = req.body.longURL;
    urlDatabase[key].userID = userID;
    urlDatabase[key].dateCreated = (new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    urlDatabase[key].uniqueVisits = 0;
    urlDatabase[key].totalVisits = 0;
    urlDatabase[key].visitLog = [];

    res.redirect(`/urls/${key}`);
  } else {
    res.statusCode = "403";
    res.end();
  }
});

//DELETE a shortURL and its corresponding longURL
app.delete("/urls/:shortURL/delete", (req,res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  //check if the URL belongs to the user
  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.statusCode = "403";
    res.render("error", { user: users[userID], error: "access denied" });
  }
});

//UPDATE the longURL for an existing shortURL
app.put("/urls/:id", (req,res) => {
  const userID = req.session.userID;
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  //check if the user is logged in
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

//create an account and check for its validity
app.post("/register", (req,res) => {
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
