const dbHelpers = require("./dbHelper");
const cron = require("node-cron");
const { getWeather } = require("./apiHelper");

let sheduledTasks = [];
let scheduledReminders = [];

const scheduleNotifications = (bot) => {
  dbHelpers.getTasksWithReminderTime((err, tasks) => {
    if (err) {
      console.log(err.message);
      return;
    }

    tasks.forEach((task) => {
      const { user_id, task_description, reminder_time, task_id } = task;
      const date = new Date(+reminder_time);

      if (!sheduledTasks.includes(task_id)) {
        cron.schedule(
          `${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${
            date.getMonth() + 1
          } *`,
          () => {
            bot.telegram.sendMessage(user_id, task_description);
            sheduledTasks = sheduledTasks.filter((item) => {
              item !== task_id;
            });
          }
        );
        sheduledTasks.push(task_id);
      }
    });
  });
};
const initializeReminders = (bot) => {
  dbHelpers.getUsers((err, users) => {
    if (err) {
      console.log(err.message);
      return;
    }

    scheduledReminders.forEach((reminder) => reminder.task.stop());
    scheduledReminders = [];

    users.forEach((user) => {
      const { user_id, cityName, time } = user;

      const [hour, minute] = time.split(":");
      const cronExpression = `${minute} ${hour} * * *`;

      const task = cron.schedule(cronExpression, async () => {
        const weather = await getWeather(cityName);
        bot.telegram.sendMessage(
          user_id,
          `Погода в городе ${cityName}: ${
            weather.weather[0].description
          } \n температура: ${weather.main.temp - 273} \n ощущается как ${
            weather.main.feels_like - 273
          }`
        );
      });

      scheduledReminders.push({ user_id, task });
    });
  });
};
const updateReminders = (ctx, isCallback) => {
  const user_id = isCallback
    ? ctx.update.callback_query.from.id
    : ctx.message.from.id;

  dbHelpers.getUserById(user_id, (err, user) => {
    if (err) {
      console.log(err.message);
      return;
    }

    const existingReminder = scheduledReminders.find(
      (reminder) => reminder.user_id === user_id
    );

    if (existingReminder) {
      existingReminder.task.stop();
      scheduledReminders = scheduledReminders.filter(
        (reminder) => reminder.user_id !== user_id
      );
    }
    if (user === undefined) {
      return;
    }
    const { cityName, time } = user;

    const [hour, minute] = time.split(":");
    const cronExpression = `${minute} ${hour} * * *`;

    const task = cron.schedule(cronExpression, async () => {
      const weather = await getWeather(cityName);
      ctx.reply(
        `Погода в городе ${cityName}: ${
          weather.weather[0].description
        } \n температура: ${weather.main.temp - 273} \n ощущается как ${
          weather.main.feels_like - 273
        }`
      );
    });

    scheduledReminders.push({ user_id, task });
  });
};

module.exports = {
  scheduleNotifications,
  updateReminders,
  initializeReminders,
};
