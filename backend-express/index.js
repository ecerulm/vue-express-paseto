const express = require("express");
const morgan = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require('./db');
const logger = require('./logger');

require('dotenv').config();

const conn = db();


(async () => {
  const serverPort = 3000;
  const app = express();

  app.use(morgan('combined'));

  app.use(bodyParser.json()); 

  const corsOptions = {
    origin: `http://localhost:${serverPort}`
  };
  app.use(cors(corsOptions));

  app.post('/api/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    res.status(401).json({
      message: "Invalid credentials"
    });

  });

  app.listen(serverPort, () => {
    logger.info("Listening on port %s", serverPort);
  })
})();

