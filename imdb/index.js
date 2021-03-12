const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const fetchData = async(url) => {
  const result = await axios.get(url);
  return result.data;
}

const main = async () => {
  const baseUrl = 'https://www.imdb.com/';

  const genresContent = await fetchData( baseUrl + 'feature/genre/?ref_=nv_ch_gr');
  const $ = cheerio.load(genresContent);

  const genres = $('.ab_links').eq(0).find('a');
  const genresArray = [];
  $(genres).each((i, e) => {
    genresArray.push({
      name: $(e).text(),
      url: baseUrl + $(e).attr('href')
    })
  });

  // // console.log(genresArray);
  // // console.log(genresArray.length);

  const moviesGenresArray = [];
  for (genre of genresArray) {
    const moviesContent = await fetchData(genre.url);
    const $ = cheerio.load(moviesContent);
    
    const movies = $('.lister-item-header a');
    const moviesUrls = [];
    $(movies).each((i, e) => {
      moviesUrls.push(baseUrl + $(e).attr('href'));
    });
    moviesGenresArray.push({
      genreName: genre.name.trim(),
      moviesUrls
    });
  //   // console.log({
  //   //   genreName: genre.name.trim(),
  //   //   moviesUrls
  //   // });
  }

  let movieCounter = 0;
  for (movieGenre of moviesGenresArray) {
    // console.log(movieGenre.genreName);
    fs.appendFile('imdb.txt', `====================== ${movieGenre.genreName} ======================\n`, (err) => {
      if (err) throw err;
      console.log('Movie genre was appended to file!')
    })
    const {moviesUrls} = movieGenre;
    for (movieUrl of moviesUrls) {
      const movieContent = await fetchData(movieUrl);
      const $ = cheerio.load(movieContent);
      // console.log($('h1').eq(0).text());
      const titleYear = $('h1').eq(0).text();
      const titleYearSeparatorIndex = titleYear.match(/\(\d{4}\)/).index;
      const title = titleYear.slice(0, titleYearSeparatorIndex-1);
      const year = titleYear.slice(titleYearSeparatorIndex+1, titleYearSeparatorIndex+5);

      const summary = $('.inline.canwrap p span').text().trim();
      const director = $('.credit_summary_item').eq(0).text().trim().replace('\n', ' ').replace('Director: ', '');
      const writers = [];
      $('.credit_summary_item').eq(1).find('a').each((i, e) => {
        writers.push($(e).text());
      });
      if(writers[writers.length - 1].includes('more credits')) writers.pop();
      const stars = [];
      $('.credit_summary_item').eq(2).find('a').each((i, e) => {
        stars.push($(e).text());
      });
      if (stars[stars.length - 1].includes('See full cast & crew')) stars.pop();

      const runtime = $('time').eq(0) ? $('time').eq(0).text().trim() : 'Undefined'
      const movieData = {
        title,
        year,
        summary,
        director,
        writers,
        stars,
        runtime
      };
      // console.log(movieData);
      fs.appendFile('imdb.txt', JSON.stringify(movieData, null, 2) + ',\n', (err) => {
        if (err) throw err;
        console.clear();
        console.log(`Movie data was appended to file! (${++movieCounter})`);
      });
    }
  }
}

main();