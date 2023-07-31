const { Markup } = require("telegraf");
const getWeatherHelper = require("../helpers/apiHelper/getWeather");
const dbHelpers = require("../helpers/dbHelper");
const { updateReminders } = require("../helpers/cronHelper");
const getWeather = async (ctx) => {
  const cityName = ctx.message.text.split(" ")[1];
  if (!cityName) {
    ctx.reply(
      'Если вы хотите найти погоду в городе, введите название города после /weather. Например "/weather Полоцк"'
    );
    return;
  }

  const weather = await getWeatherHelper.getWeather(cityName);
  if (weather) {
    ctx.replyWithMarkdown(`
      Погода в городе ${cityName}: ${weather.weather[0].description}
      Температура: ${weather.main.temp}
      Ощущается как ${weather.main.feels_like}
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

const changeNotifyTime = (ctx) => {
  const userId = ctx.from.id;
  const input = ctx.message.text;
  const regex = /^\/weathernotify\s+(\d{2}):(\d{2})$/;
  const match = input.match(regex);

  if (!match) {
    ctx.reply(
      "Некорректный формат команды. Используйте /weathernotify {ЧЧ:ММ}."
    );
    return;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    ctx.reply(
      "Некорректное значение времени. Проверьте формат и диапазон значений."
    );
    return;
  }
  const time = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  dbHelpers.addTime(userId, time, (err) => {
    if (err) {
      console.error("Ошибка при обновлении времени уведомления:", err.message);
      ctx.reply("Произошла ошибка при установке времени уведомления.");
    } else {
      ctx.reply(`Время уведомления успешно установлено: ${time}`);
    }
  });
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
      updateReminders(ctx, true);
      console.log(`Row(s) deleted`);
      ctx.reply("Подписка отменена.");
    }
  });
};

module.exports = {
  changeNotifyTime,
  getWeather,
  acceptSubscribe,
  unsubscribe,
};
