const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");

const dogActions = require("./actions/dogActions");
const catActions = require("./actions/catActions");
const cron = require("node-cron");
const rateLimitMiddleware = require("./middleware/rateLimit");
const weatherActions = require("./actions/weatherActions");
const dbHelpers = require("./helpers/dbHelper");
require("dotenv").config();

dbHelpers.initializeDatabase();

const bot = new Telegraf(process.env.BOT_TOKEN);

cron.schedule("* * * * *", () => {
  //change to 0 0 * * * (00:00)
  const query = "SELECT * FROM users;";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log(err.message);
    } else {
      rows.forEach(async (el) => {
        const weather = await getWeather(el.cityName);
        bot.telegram.sendMessage(
          el.user_id,
          `Погода в городе ${el.cityName}: ${
            weather.data.weather[0].description
          } \n температура: ${weather.data.main.temp - 273} \n ощущается как ${
            weather.data.main.feels_like - 273
          }`
        );
      });
    }
  });
});

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

bot.help((ctx) =>
  ctx.reply(
    "/weather - Погода \n /cat - Котик \n /dog - собака \n /tasklist - задачи ",
    Markup.keyboard([
      Markup.button.callback("/weather"),
      Markup.button.callback("/cat"),
      Markup.button.callback("/dog"),
      Markup.button.callback("/tasklist"),
    ])
  )
);

bot.command("cat", catActions.getCatImage);
bot.command("dog", dogActions.getDogImage);

bot.command("places", async (ctx) => {
  ctx.reply("Когда нибудь я научусь находить места");
});

bot.command("tasklist", async (ctx) => {
  ctx.reply(
    "Задачи",
    Markup.inlineKeyboard([
      Markup.button.callback("Добавить задачу", "addTask"),
      Markup.button.callback("Посмотреть список задач", "showTaskList"),
    ])
  );
});

bot.action("addTask", (ctx) => {
  return ctx.answerCbQuery("Скоро я научусь добавлять задачи");
});

bot.action("showTaskList", (ctx) => {
  return ctx.answerCbQuery("Скоро я научусь отображать задачи");
});

bot.launch();

const serverClose = () => {
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
process.once("SIGINT", serverClose);
// process.once("SIGTERM", serverClose);
