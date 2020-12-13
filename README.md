# TinyApp Project

TinyApp is a full stack RESTful web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Homepage"](https://github.com/raficelkouche/tinyapp/blob/master/docs/home.png)
!["Display all the shortened URLs for a user"](https://github.com/raficelkouche/tinyapp/blob/master/docs/urls.png)
!["Display a single URL"](https://github.com/raficelkouche/tinyapp/blob/master/docs/specific%20URL.png)
!["Create a new shortened URL"](https://github.com/raficelkouche/tinyapp/blob/master/docs/create%20URL.png)


## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Note that no database connections have been made so far. That being said, all the user and URL information are temporarily stored on the server under `urlDatabase` and `users` respectively

## Features

- Ability to view and manage all shortened URL's from a single page.
- Analytics:
  - Keep track of the number of times a short URL is visited (total visits/unique visits)
  - View a history log of every visit that has been made to the short URL (visitor ID and the date the visit was made)