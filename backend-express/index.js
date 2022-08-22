const express = require("express");
const morgan = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require('./db');
const logger = require('./logger');
const {V4} = require('paseto');
const crypto = require('crypto');
const jose = require('jose');


require('dotenv').config();


async function resetDb(conn) {
  const User = conn.model('User');
  User.collection.drop();
  const initialUser = new User({username: 'aaa', password: 'bbb'});
  const savedDocument = await initialUser.save();
  logger.info("Created initial user")
  // logger.info("Initial user %s", savedDocument);
}

(async () => {
  const conn = db();
  const User = conn.model('User');
  const secretPASERK = process.env.PASETO_SECRET_KEY

  const appId = `http://localhost/thisapp`; // we could use any string or URI

  if (!secretPASERK) {
    logger.error("PASETO_SECRET_KEY missing from environment variables or .env");
    process.exit();
  }
  const secretKeyBuffer = Buffer.from(secretPASERK.slice(10),'base64url');
  const secretKey = V4.bytesToKeyObject(secretKeyBuffer); 
  const publicKey = crypto.createPublicKey(secretKey);
  const publicJwk = await jose.exportJWK(publicKey); // publicKey is a crypto.KeyObject (PublickKeyObject)
  publicJwk.kid = await jose.calculateJwkThumbprint(publicJwk, 'sha256');
  logger.info("Public JWK %s", publicJwk);

  const serverPort = 3000;
  const app = express();

  resetDb(conn); // obviously this wouldn't be here in a real application



  app.use(morgan('combined'));

  app.use(bodyParser.json()); 

  const corsOptions = {
    origin: `http://localhost:${serverPort}`
  };
  app.use(cors(corsOptions));

  // required JSON and X-Requested-With (force CORS in the browser)
  app.use((req, res, next) => {
    if (req.is('json') && req.get('x-requested-with')) {
      return next();
    } else {
      res.status(401).json({message: "content-type must be application/json and X-Requested-By header must be present"});
    }
  });

  app.post('/api/login', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({username});
    if (!user) {
      logger.info("User %s not found", username)
      res.status(401).json({
        message: "Invalid credentials"
      });
      return;
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.info("Password incorrect for User %s", username)
      res.status(401).json({
        message: "Invalid credentials"
      });
      return;
    }
    
    //TODO generate a PASETO token
    // https://github.com/panva/paseto/blob/main/docs/README.md#v4signpayload-key-options

    const jti = crypto.randomUUID();
    const token = await V4.sign({}, secretKey, {
      sub: user.username,
      audience: appId,
      issuer: appId,
      kid: publicJwk.kid,
      jti,
    }) // options is {} 

    res.json({
      message: "Authentication successful",
      token,
    });
  });

  //TODO: reject non JSON requests
  //TODO: request if X-Requested-By not present

  // Middleware that adds req.username from PASETO token if present in Authentication: Bearer header
  app.use((req,res,next) => {


  });

  app.listen(serverPort, () => {
    logger.info("Listening on port %s", serverPort);
  })
})();

