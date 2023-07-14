const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();
const rateLimit = require("telegraf-ratelimit");

const limitConfig = {
  window: 1500,
  limit: 1,
  onLimitExceeded: (ctx, next) => ctx.reply("Буп-бип. Я не могу так часто."),
};

const db = new sqlite3.Database("./dataBase.db");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, cityName TEXT)"
  );
});

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

bot.use(rateLimit(limitConfig));

bot.use(async (ctx, next) => {
  // rateLimit(limitConfig);
  if (!ctx.message) return next();
  const inputText = ctx.message.text;
  if (inputText.startsWith("/weather")) {
    const processedText = inputText.substr("/weather".length).trim();
    if (processedText === "") {
      ctx.reply(
        'Если вы хотите найти погоду в городе, введите название города после /weather. Например "/weather Полоцк"'
      );
    } else {
      ctx.reply(`Город который ты ввел: ${processedText}`);
      weather = await getWeather(processedText);
      ctx.reply(
        `Погода: ${weather.data.weather[0].description} \n температура: ${
          weather.data.main.temp - 273
        } \n ощущается как ${weather.data.main.feels_like - 273}`
      );
      ctx.reply(
        `Подписаться на ежедневный прогноз погоды города ${processedText} ?`,
        Markup.inlineKeyboard([
          Markup.button.callback("Да", `acceptSubscribe-${processedText}`),
        ])
      );
    }
  }
  return next();
});

const getWeather = async (cityName) => {
  console.log(cityName);
  try {
    const responseWeather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_TOKEN}`
    );
    console.log(responseWeather);
    return responseWeather;
  } catch (e) {
    console.log(e);
    return;
  }
};

const getDog = async () => {
  try {
    const responsePicName = await axios.get("https://random.dog/woof");
    return responsePicName.data;
  } catch (e) {
    return;
  }
};
const getCat = async () => {
  try {
    const responsePicName = await axios.get(
      "https://api.thecatapi.com/v1/images/search"
    );
    return responsePicName.data[0].url;
  } catch (e) {
    return;
  }
};
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

bot.command("cat", async (ctx) => {
  ctx.reply(await getCat()); // change to replyWithPhoto
});
bot.command("dog", async (ctx) => {
  ctx.reply(`https://random.dog/${await getDog()}`); // change to replyWithPhoto
});

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

bot.action(/acceptSubscribe-.+/, (ctx) => {
  const action = ctx.callbackQuery.data;
  const city = action.replace("acceptSubscribe-", "");
  const user_id = ctx.update.callback_query.from.id;
  db.run(
    `INSERT INTO users (user_id, cityName) VALUES (?, ?)`,
    [user_id, city],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          ctx.reply(
            "Нельзя иметь подписку более чем на один город.",
            Markup.inlineKeyboard([
              Markup.button.callback("Отписаться", "unsubscribe"),
            ])
          );
          return console.error(err.message);
        } else {
          ctx.reply("Произошла какая-то ошибка, которую я еще не знаю");
          return console.error(err.message);
        }
      }
      ctx.reply(
        `Теперь вы подписаны на город ${city}`,
        Markup.inlineKeyboard([
          Markup.button.callback(
            "Я нажал случайно, хочу отписаться!",
            "unsubscribe"
          ),
        ])
      );
      console.log(`Новый чебз добавлен с ID ${user_id}`);
    }
  );
});

bot.action("addTask", (ctx) => {
  return ctx.answerCbQuery("Скоро я научусь добавлять задачи");
});

bot.action("unsubscribe", (ctx) => {
  db.run(
    `DELETE FROM users WHERE user_id = ?`,
    ctx.update.callback_query.from.id,
    function (err) {
      if (err) {
        ctx.reply("Произошла непредвиденная ошибка.");
        console.error(err.message);
      } else {
        console.log(`Row(s) deleted ${this.changes}`);
        ctx.reply("Подписка отменена.");
      }
    }
  );
});

bot.action("showTaskList", (ctx) => {
  return ctx.answerCbQuery("Скоро я научусь отображать задачи");
});

bot.launch();

const serverClose = () => {
  const query = "SELECT * FROM users;";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log(err.message);
    } else {
      rows.forEach((el) => {
        bot.telegram.sendMessage(el.user_id, "Бот временно выключен.");
      });
    }
  });
  db.close();
  bot.stop("SIGINT");
};
process.once("SIGINT", serverClose);
// process.once("SIGTERM", serverClose);
