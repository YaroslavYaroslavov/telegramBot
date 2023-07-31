const axios = require("axios");

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
};
