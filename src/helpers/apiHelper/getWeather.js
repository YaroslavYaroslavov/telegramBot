const axios = require("axios");

const getWeather = async (cityName) => {
  try {
    const responseWeather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&lang=ru&appid=${process.env.WEATHER_TOKEN}`
    );
    return responseWeather.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
module.exports = {
  getWeather,
};
