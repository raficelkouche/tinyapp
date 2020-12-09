function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
//Server Setup
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Routing
app.get("/", (req,res) => {
  res.send("hello");
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req,res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);//Redirect requests to the actual long URL
});

app.post("/urls", (req,res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});