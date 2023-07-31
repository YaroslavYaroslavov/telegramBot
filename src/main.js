const { Telegraf } = require("telegraf");

const { actionsInit } = require("./helpers/botHelper/actionsInit");
const { botStartConfig } = require("./helpers/botHelper/botStartConfig");
const { botCommandInit } = require("./helpers/botHelper/commandInit");

const { serverClose } = require("./actions/serverActions");

const rateLimitMiddleware = require("./middleware/rateLimit");

const dbHelpers = require("./helpers/dbHelper");
const {
  scheduleNotifications,
  initializeReminders,
} = require("./helpers/cronHelper");

require("dotenv").config({ path: "../.env" });

dbHelpers.initializeDatabase();

const bot = new Telegraf(process.env.BOT_TOKEN);

actionsInit(bot);

botStartConfig(bot);

botCommandInit(bot);

scheduleNotifications(bot);

initializeReminders(bot);

bot.use(rateLimitMiddleware);
bot.launch();

process.once("SIGINT", () => {
  serverClose(bot);
});
process.once("SIGTERM", () => {
  serverClose(bot);
});
