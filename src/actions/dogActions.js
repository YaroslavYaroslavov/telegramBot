const { getDog } = require("../helpers/apiHelper/getDog");

const getDogImage = async (ctx) => {
  const dogImageUrl = await getDog();
  if (dogImageUrl) {
    ctx.replyWithPhoto({ url: `https://random.dog/${dogImageUrl}` });
  } else {
    ctx.reply("Не удалось получить изображение собаки");
  }
};

module.exports = {
  getDogImage,
};
