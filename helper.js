/* Contains a set of helper functions */
function generateRandomString() {                     //Generates a 6-digit random string
  return Math.random().toString(36).substring(2, 8);
};

function getUserByEmail(users, email) {               //Returns a user's unique ID if the email was found
  for (const user in users) {
    if (users[user].email === email) {
      return user; //string
    }
  }
  return undefined;
};

function getURLsForUser(urlDatabase, id) {                //Returns an object that contains the URLs for a given user
  const filteredURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredURLs[key] = urlDatabase[key];
    }
  }
  return filteredURLs;
};

module.exports = { generateRandomString, getUserByEmail, getURLsForUser };