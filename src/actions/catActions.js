const { getCat } = require("../helpers/apiHelper/getCat");

const getCatImage = async (ctx) => {
  const catImageUrl = await getCat();
  if (catImageUrl) {
    ctx.replyWithPhoto({ url: catImageUrl });
  } else {
    ctx.reply("Не удалось получить изображение кота");
  }
};

module.exports = {
  getCatImage,
};
