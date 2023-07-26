const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");

const { getDogImage } = require("./actions/dogActions");
const { getCatImage } = require("./actions/catActions");
const { getPlacesInfo } = require("./actions/placesActions");
const { serverClose } = require("./actions/serverActions");

const rateLimitMiddleware = require("./middleware/rateLimit");
const weatherActions = require("./actions/weatherActions");
const dbHelpers = require("./helpers/dbHelper");
const taskActions = require("./actions/taskActions");
const {
  scheduleNotifications,
  initializeReminders,
  updateReminders,
} = require("./helpers/cronHelper");

require("dotenv").config();

dbHelpers.initializeDatabase();

const bot = new Telegraf(process.env.BOT_TOKEN);

scheduleNotifications(bot);

bot.use(rateLimitMiddleware);

bot.command("weather", weatherActions.getWeather);

bot.action(/acceptSubscribe-.+/, weatherActions.acceptSubscribe);

bot.action("unsubscribe", weatherActions.unsubscribe);

bot.start((ctx) =>
  ctx.reply(
    "Привет! Давай узнаем что я могу?",
    Markup.keyboard([Markup.button.callback("/help", "helpBtn")])
  )
);
initializeReminders(bot);
bot.help((ctx) =>
  ctx.reply(
    "/weather - Погода \n /cat - Котик \n /dog - собака \n /tasklist - задачи \n /weathernotify - изменить время рассылки погоды \n /addtask - добавить задачу \n /deletetask - удалить задачу \n /places - места рядом",
    Markup.keyboard([
      Markup.button.callback("/weather"),
      Markup.button.callback("/cat"),
      Markup.button.callback("/dog"),
      Markup.button.callback("/tasklist"),
      Markup.button.callback("/places"),
    ])
  )
);

bot.command("cat", getCatImage);
bot.command("dog", getDogImage);

bot.command("weathernotify", async (ctx) => {
  weatherActions.changeNotifyTime(ctx);
  updateReminders(ctx, false);
});

bot.command("places", async (ctx) => {
  getPlacesInfo(ctx);
});

bot.command("tasklist", taskActions.showTaskList);
bot.command("addtask", (ctx) => {
  taskActions.validateTask(ctx);
  scheduleNotifications(bot);
});
bot.command("deletetask", (ctx) => {
  taskActions.deleteTask(ctx);
  scheduleNotifications(bot);
});

bot.launch();

process.once("SIGINT", () => {
  serverClose(bot);
});
process.once("SIGTERM", () => {
  serverClose(bot);
});
