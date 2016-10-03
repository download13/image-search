const express = require('express');
const request = require('request');


const app = express();

app.use(express.static('public'));

app.get('/search', (req, res) => {
  const offset = req.query.offset || 0;
  const terms = req.query.q || '';
  
  search(terms, offset)
    .then(result => result.value.map(translate))
    .then(data => {
      res.send(data);
    }).catch(err => console.error(err));
});

app.get('/searches', (req, res) => {
  res.send(searches);
});

app.listen(process.env.PORT, () => console.log('Listening'));


const searches = [];
function addSearch(term) {
  searches.unshift({term, when: Date.now()});
  
  if(searches.length > 50) {
    searches.pop();
  }
}

function search(terms, offset) {
  addSearch(terms);
  
  return new Promise((resolve, reject) => {
    request(
    {
      url: `https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=${terms}&offset=${offset}`,
      headers: {
        'Authorization': 'Client-ID 7b4a706d08ed993',
        'Ocp-Apim-Subscription-Key': 'a3310a3d9db24371b87b5b3d3802fc38'
      },
      body: terms
    },
    (err, response, body) => {
      if(err) return reject(err);

      resolve(JSON.parse(body));
    });
  });
}

function translate(item) {
  return {
    url: item.contentUrl,
    thumbnail: item.thumbnailUrl,
    context: item.hostPageUrl,
    snippet: item.hostPageDisplayUrl
  };
}