const axios = require('axios');
const cheerio = require('cheerio');

const fetchData = async (url) => {
  const result = await axios.get(url);
  return result.data;
}

const main = async () => {
  const baseUrl = 'https://www.primevideo.com'

  const content = await fetchData(baseUrl + '/region/na/storefront/movie/ref=atv_nb_sf_mv');
  const $ = cheerio.load(content);

  const generos = [];
  $('.data-v-1251986e').each((i, e) => {
    const genero = $(e).find('h2').text();
    console.log('oi')
  });
}

main();