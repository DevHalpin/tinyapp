const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserObjectFromId = (usernameId,users) => {
  for (const id in users) {
    if (id === usernameId) {
      return users[id];
    }
  }
};

const urlsForUser = (id, urlDatabase) => {
  const database = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      database[url] = urlDatabase[url];
    }
  }
  return database;
};

const getUserObjectFromEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

module.exports = {getUserObjectFromEmail, getUserObjectFromId, generateRandomString, urlsForUser};