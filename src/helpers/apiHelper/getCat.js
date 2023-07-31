const axios = require("axios");

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
  getCat,
};
