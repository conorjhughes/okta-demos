const express = require("express");
const session = require("express-session");
const { ExpressOIDC } = require("@okta/oidc-middleware");

const config = require("./config");

const app = express();
const oidc = new ExpressOIDC(config.oidc);

app.use(session(config.session));

// Includes /login and /authorization-code/callback routes
app.use(oidc.router);

app.get("/", (req, res) => {
  if (!req.userContext) {
    return res.redirect("/login");
  } else {
    return res.status(200).json({
      user: req.userContext.userinfo,
    });
  }
});

oidc.on("ready", () => {
  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
  });
});

oidc.on("error", (err) => {
  console.error(err);
});
