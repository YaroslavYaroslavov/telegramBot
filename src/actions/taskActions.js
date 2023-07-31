const dbHelpers = require("../helpers/dbHelper");

const showTaskList = (ctx) => {
  const userId = ctx.from.id;
  dbHelpers.getTasks(userId, (err, rows) => {
    if (err) {
      console.log(err.message);
      ctx.reply("Произошла ошибка при получении списка задач.");
    } else {
      if (rows.length === 0) {
        ctx.reply("У вас пока нет задач.");
      } else {
        let taskList = "";
        rows.forEach((row) => {
          taskList += `ID: ${row.task_id}\nОписание: ${row.task_description}\nВремя напоминания: ${row.reminder_time}\n\n`;
        });
        ctx.replyWithMarkdown(`Список задач:\n\n${taskList}`);
      }
    }
  });
};

const deleteTask = (ctx) => {
  const taskId = parseInt(ctx.message.text.split(" ")[1], 10);

  if (isNaN(taskId) || taskId <= 0) {
    ctx.reply("Номер задачи должен быть числом больше нуля.");
    return;
  }

  dbHelpers.checkTaskExists(taskId, (err, exists) => {
    if (err) {
      console.error(err.message);
      ctx.reply("Произошла ошибка при проверке задачи.");
      return;
    }

    if (!exists) {
      ctx.reply(`Задачи с номером ${taskId} не существует.`);
      return;
    }

    dbHelpers.deleteTask(taskId, (deleteErr) => {
      if (deleteErr) {
        console.error(deleteErr.message);
        ctx.reply("Произошла ошибка при удалении задачи.");
      } else {
        ctx.reply(`Задача с номером ${taskId} удалена.`);
      }
    });
  });
};

const validateTask = (ctx) => {
  const regex =
    /^\/addtask\s+(.+?)(?:\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}))?$/;
  const match = ctx.message.text.match(regex);
  if (!match) {
    ctx.reply(
      "Не валидный формат: добавить задачу можно командой /addtask Название задачи ГГГГ-ММ-ДД ЧЧ:ММ:СС"
    );
    return null;
  }

  const taskName = match[1].trim();
  const dateTime = match[2] ? new Date(match[2]) : null;
  const userId = ctx.from.id;

  if (!taskName) {
    ctx.reply("Пожалуйста, укажите описание задачи после команды.");
    return;
  }
  if (dateTime <= Date.now() && dateTime) {
    ctx.reply("Послание в прошлое?!");
    return;
  }

  dbHelpers.addTask(userId, taskName, dateTime, (err) => {
    if (err) {
      console.error("Ошибка при удалении задачи:", err.message);
      ctx.reply("Ошибка при удалении задачи");
    } else {
      ctx.reply("Задача успешно добавлена.");
    }
  });
};

module.exports = {
  showTaskList,
  deleteTask,
  validateTask,
};
