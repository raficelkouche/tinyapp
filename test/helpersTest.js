const { assert }  = require('chai');
const { getUserByEmail } = require("../helper");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", function() {
  it("should return the userID of a user with a valid email", function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    assert.equal(user, "userRandomID" );
  })

  it("should return undefined if the given email is not in the database", function() {
    const user = getUserByEmail(testUsers, "fail@test.com");
    assert.equal(user, undefined);
  })
})