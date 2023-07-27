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

const getPlaces = async (cityName) => {
  try {
    const cityCoord = await axios.get(
      `https://api.opentripmap.com/0.1/ru/places/geoname?name=${cityName}&apikey=${process.env.PLACES_TOKEN}`
    );

    if (cityCoord.data.status === "OK") {
      const { lat, lon } = cityCoord.data;
      const cityPlaces = await axios.get(
        `https://api.opentripmap.com/0.1/ru/places/radius?radius=1000&lon=${lon}&lat=${lat}&format=json&apikey=${process.env.PLACES_TOKEN}`
      );

      return cityPlaces.data;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = {
  getPlaces,
  getWeather,
  getDog,
  getCat,
};
