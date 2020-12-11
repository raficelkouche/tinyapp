# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Homepage"](#)
!["Display all the shortened URLs for a user"](#)
!["Create a new shortened URL"](#)
!["Display a single URL"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Note that no database connections have been made so far. That being said, all the user and URL information are temporarily stored on the server under `urlDatabase` and `users` respectively