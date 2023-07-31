const { Markup } = require("telegraf");
const botStartConfig = (bot) => {
  bot.start((ctx) =>
    ctx.reply(
      "Привет! Давай узнаем что я могу?",
      Markup.keyboard([Markup.button.callback("/help", "helpBtn")])
    )
  );

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
};

module.exports = { botStartConfig };
