const axios = require("axios");

const getDog = async () => {
  try {
    const responsePicName = await axios.get("https://random.dog/woof");
    return responsePicName.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = {
  getDog,
};
