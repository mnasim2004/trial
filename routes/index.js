var express = require("express");
var router = express.Router();

router.get("/users", function (req, res, next) {
  res.render("index.hbs", { title: "Login" , loggedIn: req.session.loggedIn });
});

/* GET home page. */

module.exports = router;
