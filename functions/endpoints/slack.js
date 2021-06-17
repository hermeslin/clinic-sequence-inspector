const express = require('express');
const bodyParser = require('body-parser');
const functions = require('firebase-functions');
const verifyToken = require('../middlewares/verifyToken');
const urlVerification = require('../controllers/urlVerification');
const eventCallback = require('../controllers/eventCallback');

const app = express();

// middlewares
app.use(bodyParser.json());
app.use(verifyToken);

app.post('/*', (req, res) => {
  const { type } = req.body;

  switch (type) {
    case 'url_verification':
      urlVerification(req, res);
      break;
    case 'event_callback':
      eventCallback(req, res);
      break;
    default:
      res.status(400).send({ message: 'Bad Request' });
  }
});

// expors
module.exports = functions.https.onRequest(app);
