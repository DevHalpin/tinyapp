const { assert } = require('chai');

const { getUserObjectFromEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserObjectFromEmail("user@example.com", testUsers).id;
    const expectedOutput = "userRandomID";
    assert.equal(user,expectedOutput);
  });
  it('should return null with invalid email', function() {
    const user = getUserObjectFromEmail("a@a.com", testUsers);
    const expectedOutput = null;
    assert.equal(user,expectedOutput);
  });
});