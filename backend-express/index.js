const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const logger = require("./logger");
const { V4 } = require("paseto");
const crypto = require("crypto");
const jose = require("jose");

require("dotenv").config();

function getPasetoFooter(token) {
  try {
    const footer = JSON.parse(Buffer.from(token.split(".").pop(), "base64url"));
    return footer;
  } catch (err) {
    return undefined;
  }
}

async function resetDb(conn) {
  const User = conn.model("User");
  User.collection.drop();
  const initialUser = new User({ username: "aaa", password: "bbb" });
  const savedDocument = await initialUser.save();
  logger.info("Created initial user");
  // logger.info("Initial user %s", savedDocument);
}

(async () => {
  const conn = db();
  const User = conn.model("User");
  const secretPASERK = process.env.PASETO_SECRET_KEY;

  const appId = `http://localhost/thisapp`; // we could use any string or URI

  if (!secretPASERK) {
    logger.error(
      "PASETO_SECRET_KEY missing from environment variables or .env"
    );
    process.exit();
  }
  const secretKeyBuffer = Buffer.from(secretPASERK.slice(10), "base64url");
  const secretKey = V4.bytesToKeyObject(secretKeyBuffer);
  const publicKey = crypto.createPublicKey(secretKey);
  const publicJwk = await jose.exportJWK(publicKey); // publicKey is a crypto.KeyObject (PublickKeyObject)
  publicJwk.kid = await jose.calculateJwkThumbprint(publicJwk, "sha256");
  logger.info("Public JWK %s", publicJwk);

  const keys = {
    [publicJwk.kid]: {
      publicKey: publicKey,
      privateKey: secretKey,
    },
  };

  const serverPort = 3000;
  const app = express();

  resetDb(conn); // obviously this wouldn't be here in a real application

  app.use(morgan("combined"));

  app.use(bodyParser.json());

  const corsOptions = {
    origin: "http://localhost:5173",
  };
  app.use(cors(corsOptions));

  // required JSON and X-Requested-With (force CORS in the browser)
  app.use((req, res, next) => {
    if (req.is("json") !== false && req.get("x-requested-with")) {
      return next();
    } else {
      logger.info("json %s", req.is("json"));
      logger.info("x-requested-with %s", req.get("x-requested-with"));
      res.status(401).json({
        message:
          "content-type must be application/json and X-Requested-By header must be present",
      });
    }
  });

  app.post("/api/login", async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({ username });
    if (!user) {
      logger.info("User %s not found", username);
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.info("Password incorrect for User %s", username);
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    // https://github.com/panva/paseto/blob/main/docs/README.md#v4signpayload-key-options
    const jti = crypto.randomUUID();
    logger.info("Generate token for sub = %s", user.username);
    const token = await V4.sign({}, secretKey, {
      subject: user.username,
      audience: appId,
      issuer: appId,
      kid: publicJwk.kid,
      footer: {
        kid: publicJwk.kid,
      },
      jti,
    }); // options is {}

    res.json({
      message: "Authentication successful",
      token,
    });
  });

  // Middleware that adds req.username from PASETO token if present in Authentication: Bearer header
  app.use(async (req, res, next) => {
    const authHeader = req.get("authorization");
    logger.info("authHeader %s", authHeader);
    if (!authHeader) return next();
    const bearer = "Bearer ";
    if (!authHeader.startsWith(bearer)) return next();
    const token = authHeader.substring(bearer.length);
    logger.info("token is '%s'", token);

    const footer = getPasetoFooter(token);
    const kid = footer?.kid;
    const pK = keys[kid]?.publicKey;
    if (!pK) {
      logger.info("Can't find %s in keys", kid);
      return next();
    }

    const verifyResult = await V4.verify(token, pK, {
      audience: appId, // expected aud
      issuer: appId, //expected issuer
    });

    logger.info("verifyResult %s", verifyResult);
    if (verifyResult.kid !== kid) {
      logger.info(
        "Invalid token the kid in claims does not match kid in footer"
      );
      return next();
    }

    req.username = verifyResult.sub;
    logger.info("req.username = %s", req.username);
    return next();
  });

  app.get("/api/userinfo", (req, res, next) => {
    res.json({
      username: req.username,
      loggedInStatus: Boolean(req.username),
    });
  });

  // TODO: the API calls that require authentication
  //
  const securedApi = express.Router();

  securedApi.use(async (req, res, next) => {
    if (!req.username) {
      return res
        .status(403)
        .json({ message: "you need be loggedin to access this endpoint" });
    }

    const user = await User.findOne({ username: req.username });
    if (!user) {
      logger.error("Can't find the username %s in DB");
      return res.status(500).json({ message: "" });
    }
    req.user = user;
    return next();
  });

  securedApi.get("/getcounter", async (req, res, next) => {
    res.json({ counter: req.user.counter });
  });

  securedApi.post("/increasecounter", async (req, res, next) => {
    req.user.counter += 1;
    const result = await req.user.save();

    res.json({ counter: result.counter });
  });

  app.use("/api/secured/", securedApi); //

  app.listen(serverPort, () => {
    logger.info("Listening on port %s", serverPort);
  });
})();
