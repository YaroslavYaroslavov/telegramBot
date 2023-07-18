const apiHelpers = require("../helpers/apiHelper");

const getCatImage = async (ctx) => {
  const catImageUrl = await apiHelpers.getCat();
  if (catImageUrl) {
    ctx.replyWithPhoto({ url: catImageUrl });
  } else {
    ctx.reply("Не удалось получить изображение кота");
  }
};

module.exports = {
  getCatImage,
};
