/* Contains a set of helper functions */
function generateRandomString() {                     //Generates a 6-digit random string
  return Math.random().toString(36).substring(2, 8);
};

function getUserByEmail(users, email) {               //Returns a user's unique ID if the email was found
  for (let user in users) {
    if (users[user].email === email) {
      return user; //string
    }
  }
  return undefined;
};

function urlsForUser(urlDatabase, id) {                //Returns an object that contains the URLs for a given user
  const filteredURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredURLs[key] = urlDatabase[key];
    }
  }
  return filteredURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };