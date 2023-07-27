const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./dataBase.db");

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, cityName TEXT, time TEXT DEFAULT '08:00')"
    );
    db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task_description TEXT,
    reminder_time TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  )
`);
  });
};
const addTime = (userId, time, callback) => {
  const sql = "UPDATE users SET time = ? WHERE user_id = ?";
  db.run(sql, [time, userId], function (err) {
    if (err) {
      callback(err);
    } else {
      if (this.changes === 0) {
        callback(new Error("User not found"));
      } else {
        callback(null);
      }
    }
  });
};
const addUser = (userId, cityName, callback) => {
  const query = "INSERT INTO users (user_id, cityName) VALUES (?, ?)";
  db.run(query, [userId, cityName], callback);
};

const deleteUser = (userId, callback) => {
  const query = "DELETE FROM users WHERE user_id = ?";
  db.run(query, userId, function (err) {
    if (err) {
      callback(err);
    } else {
      if (this.changes === 0) {
        callback(new Error("User not found"));
      } else {
        callback(null);
      }
    }
  });
};

const getUsers = (callback) => {
  const query = "SELECT * FROM users";
  db.all(query, [], callback);
};

const addTask = (userId, taskDescription, reminderTime, callback) => {
  db.run(
    `
    INSERT INTO tasks (user_id, task_description, reminder_time)
    VALUES ( ?, ?, ?)
  `,
    [userId, taskDescription, reminderTime],
    callback
  );
};
const getTasks = (userId, callback) => {
  const query = `
    SELECT * FROM tasks
    WHERE user_id = ?
  `;
  db.all(query, [userId], callback);
};
const deleteTask = (taskId, callback) => {
  db.run(
    `
    DELETE FROM tasks
    WHERE task_id = ?
  `,
    [taskId],
    callback
  );
};
const closeDatabase = () => {
  db.close();
};

const getTasksWithReminderTime = (callback) => {
  const query = `
    SELECT * FROM tasks
    WHERE reminder_time IS NOT NULL
  `;
  db.all(query, callback);
};
const checkUserExists = (user_id, callback) => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  db.all(query, [user_id], (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      const userExists = row !== undefined;
      callback(null, userExists);
    }
  });
};

const checkTaskExists = (taskId, callback) => {
  const sql = "SELECT COUNT(*) AS count FROM tasks WHERE task_id = ?";

  db.get(sql, [taskId], (err, row) => {
    if (err) {
      callback(err);
      return;
    }

    const exists = row.count > 0;
    callback(null, exists);
  });
};
const getUserById = (user_id, callback) => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  db.get(query, [user_id], (err, row) => {
    if (err) {
      console.log("Ошибка при получении пользователя");
      callback(err, null);
    } else {
      console.log(row);
      callback(null, row);
    }
  });
};

module.exports = {
  checkUserExists,
  getTasksWithReminderTime,
  addTime,
  checkTaskExists,
  deleteTask,
  initializeDatabase,
  addUser,
  deleteUser,
  getUsers,
  addTask,
  getTasks,
  closeDatabase,
  getUserById,
};
//something
