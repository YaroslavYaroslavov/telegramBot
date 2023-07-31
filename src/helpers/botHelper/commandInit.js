const { getDogImage } = require("../../actions/dogActions");
const { getCatImage } = require("../../actions/catActions");
const { getPlacesInfo } = require("../../actions/placesActions");
const { scheduleNotifications, updateReminders } = require("../cronHelper");
const taskActions = require("../../actions/taskActions");
const weatherActions = require("../../actions/weatherActions");

const botCommandInit = (bot) => {
  bot.command("weather", weatherActions.getWeather);
  bot.command("cat", (ctx) => {
    try {
      getCatImage(ctx);
    } catch (error) {
      ctx.reply(
        "Произошла непредвиненная ошибка. Пожалуйста попробуйте еще раз."
      );
    }
  });
  bot.command("dog", (ctx) => {
    try {
      getDogImage(ctx);
    } catch (error) {
      ctx.reply(
        "Произошла непредвиненная ошибка. Пожалуйста попробуйте еще раз."
      );
    }
  });

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

  bot.command("weather", weatherActions.getWeather);
};
module.exports = {
  botCommandInit,
};
