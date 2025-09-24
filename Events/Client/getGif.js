const axios = require("axios");

async function getGif(query) {
  try {
    const apiKey = process.env.GIPHY_API_KEY;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=pg-13`;
    const res = await axios.get(url);
    if (res.data.data.length > 0) {
      const gif = res.data.data[Math.floor(Math.random() * res.data.data.length)];
      return gif.images.original.url;
    }
    return null;
  } catch (err) {
    console.error("❌ Error obteniendo GIF de Giphy:", err);
    return null;
  }
}

module.exports = getGif;
