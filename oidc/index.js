const express = require("express");
const session = require("express-session");
const { ExpressOIDC } = require("@okta/oidc-middleware");

const config = require("./config");

const app = express();
const oidc = new ExpressOIDC(config.oidc);

app.use(session(config.session));

/* 
Includes following routes:

/login
/logout
/authorization-code/callback
*/
app.use(oidc.router);

app.get("/", (req, res) => {
  if (!req.userContext) {
    return res.redirect("/login");
  } else {
    // Check group
    if (
      req.userContext?.userinfo[config.oidc.rolesClaim]?.includes(
        "dev-developer"
      )
    ) {
      res.send(`
        <pre>${JSON.stringify(req.userContext, undefined, 2)}</pre>
        <form method="POST" action="/logout">
          <button type="submit">Logout</button>
        </form>
      `);
    } else {
      return res.status(401).json({
        message: "You are not authorized",
      });
    }
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
