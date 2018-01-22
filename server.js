const express = require('express');
const { stringify } = require('querystring');
const bodyParser = require('body-parser');
require('@remy/envy');
const memory = require('./index');
const app = express();

app.disable('x-powered-by');

// CORS
app.use((req, res, next) => {
  res.header({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// FIXME send README
app.get('/', (req, res) => res.json(memory.stats()));

app.get(['/:id.:format(raw)', '/:id'], (req, res) => {
  const result = memory.get(req.params.id);
  if (result instanceof Error) {
    return res.status(404).json({ error: 'not found' });
  }
  res.setHeader('content-type', result.mime);
  const body = req.params.format === 'raw' ? result.body : result;
  res.send(body);
});

app.post('/', (req, res) => {
  const query = req.url.startsWith('/?') ? `?${stringify(req.query)}` : '';
  const result = memory.put(req);
  res
    .status(303)
    .header({ Location: `${process.env.REDIRECT_URL}/${result.id}${query}` })
    .json(result);
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
