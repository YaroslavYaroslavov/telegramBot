const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./dataBase.db");

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, cityName TEXT)"
    );
  });
};

const addUser = (userId, cityName, callback) => {
  const query = "INSERT INTO users (user_id, cityName) VALUES (?, ?)";
  db.run(query, [userId, cityName], callback);
};

const deleteUser = (userId, callback) => {
  const query = "DELETE FROM users WHERE user_id = ?";
  db.run(query, userId, callback);
};

const getUsers = (callback) => {
  const query = "SELECT * FROM users";
  db.all(query, [], callback);
};

const closeDatabase = () => {
  db.close();
};

module.exports = {
  initializeDatabase,
  addUser,
  deleteUser,
  getUsers,
  closeDatabase,
};
//something
