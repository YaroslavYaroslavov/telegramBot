const dbHelpers = require("../helpers/dbHelper");
const serverClose = (bot) => {
  dbHelpers.getUsers((err, rows) => {
    if (err) {
      console.log(err.message);
    } else {
      rows.forEach((el) => {
        bot.telegram.sendMessage(el.user_id, "Бот временно выключен.");
      });
    }
  });
  dbHelpers.closeDatabase();
  bot.stop("SIGINT");
};

module.exports = {
  serverClose,
};
