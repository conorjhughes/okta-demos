const fs = require("fs");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const { Strategy } = require("@node-saml/passport-saml");

const config = require("./config");

const app = express();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new Strategy(
    {
      entryPoint: config.saml.entryPoint,
      issuer: config.saml.issuer,
      protocol: config.saml.protocol,
      path: config.saml.path,
      cert: fs.readFileSync(config.saml.cert, "utf-8"),
    },
    (user, done) => {
      return done(null, user);
    }
  )
);

app.use(session(config.session));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  } else {
    return res.status(200).json({
      user: req.user,
    });
  }
});

app.get(
  "/login",
  passport.authenticate("saml", config.saml.options),
  (req, res, next) => {
    return res.redirect("/");
  }
);

app.post(
  "/login/callback",
  passport.authenticate("saml", config.saml.options),
  (req, res, next) => {
    return res.redirect("/");
  }
);

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});
