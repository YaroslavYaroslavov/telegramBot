// actions/weatherActions.js

const { Markup } = require("telegraf");
const apiHelpers = require("../helpers/apiHelper");
const dbHelpers = require("../helpers/dbHelper");

const getWeather = async (ctx) => {
  const cityName = ctx.message.text.split(" ")[1];
  if (!cityName) {
    ctx.reply(
      'Если вы хотите найти погоду в городе, введите название города после /weather. Например "/weather Полоцк"'
    );
    return;
  }

  const weather = await apiHelpers.getWeather(cityName);
  if (weather) {
    ctx.replyWithMarkdown(`
      Погода в городе ${cityName}: ${weather.weather[0].description}
      Температура: ${weather.main.temp - 273}
      Ощущается как ${weather.main.feels_like - 273}
    `);
    ctx.reply(
      `Подписаться на ежедневный прогноз погоды города ${cityName}?`,
      Markup.inlineKeyboard([
        Markup.button.callback("Да", `acceptSubscribe-${cityName}`),
      ])
    );
  } else {
    ctx.reply(`Не удалось получить информацию о погоде для города ${cityName}`);
  }
};

const acceptSubscribe = (ctx) => {
  const action = ctx.callbackQuery.data;
  const city = action.replace("acceptSubscribe-", "");
  const userId = ctx.update.callback_query.from.id;

  dbHelpers.addUser(userId, city, (err) => {
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
    console.log(`Новый пользователь добавлен с ID ${userId}`);
  });
};

const unsubscribe = (ctx) => {
  const userId = ctx.update.callback_query.from.id;

  dbHelpers.deleteUser(userId, (err) => {
    if (err) {
      ctx.reply("Произошла непредвиденная ошибка.");
      console.error(err.message);
    } else {
      console.log(`Row(s) deleted`);
      ctx.reply("Подписка отменена.");
    }
  });
};

module.exports = {
  getWeather,
  acceptSubscribe,
  unsubscribe,
};
