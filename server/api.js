const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const db = require('./db/index.js');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/products/search', (request, response) => {
  db.api(request.query).then(x => {
    response.send(x);
  });
});

app.get('/products/:id', (request, response) => {
  db.find({'_id':request.params.id}).then(x => {
    response.send({'product': x});
  });
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
