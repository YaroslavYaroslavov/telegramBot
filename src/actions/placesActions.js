const { getPlaces } = require("../helpers/apiHelper/getPlaces");

const getPlacesInfo = async (ctx) => {
  const cityName = ctx.message.text.split(" ")[1];
  if (!cityName) {
    ctx.reply(
      "Что-бы найти достопримечательности впишите город, например /places Полоцк"
    );
    return;
  }
  const places = await getPlaces(cityName);
  const alredyExist = [];
  if (places && places.length > 0) {
    let answer = `Вот, что я нашел по вашему запросу:\n`;

    places.forEach((el) => {
      if (
        !el.name ||
        alredyExist.some(
          (obj) => obj.lat === el.point.lat || obj.lon === el.point.lon
        ) ||
        alredyExist.length > 25
      )
        return;

      alredyExist.push(el.point);
      answer += `
    ${alredyExist.length}. Название: ${el.name}
    Оценка: ${el.rate}/10\n`;
    });
    ctx.reply(answer);
  } else {
    ctx.reply("Не удалось получить информацию о достопремичательностях");
  }
};

module.exports = {
  getPlacesInfo,
};
