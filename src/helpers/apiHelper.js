const axios = require("axios");

const getWeather = async (cityName) => {
  try {
    const responseWeather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_TOKEN}`
    );
    return responseWeather.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getDog = async () => {
  try {
    const responsePicName = await axios.get("https://random.dog/woof");
    return responsePicName.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getCat = async () => {
  try {
    const responsePicName = await axios.get(
      "https://api.thecatapi.com/v1/images/search"
    );
    return responsePicName.data[0].url;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = {
  getWeather,
  getDog,
  getCat,
};
