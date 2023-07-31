const weatherActions = require("../../actions/weatherActions");

const actionsInit = (bot) => {
  bot.action(/acceptSubscribe-.+/, weatherActions.acceptSubscribe);

  bot.action("unsubscribe", weatherActions.unsubscribe);
};

module.exports = { actionsInit };
