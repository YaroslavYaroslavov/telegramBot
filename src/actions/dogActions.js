const apiHelpers = require("../helpers/apiHelper");

const getDogImage = async (ctx) => {
  const dogImageUrl = await apiHelpers.getDog();
  if (dogImageUrl) {
    ctx.replyWithPhoto({ url: `https://random.dog/${dogImageUrl}` });
  } else {
    ctx.reply("Не удалось получить изображение собаки");
  }
};

module.exports = {
  getDogImage,
};
