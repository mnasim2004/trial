var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index.hbs", { title: "Trial Mate - Home" , loggedIn: req.session.loggedIn });
});

router.get("/users", function (req, res, next) {
  res.render("index.hbs", { title: "Trial Mate - Home" , loggedIn: req.session.loggedIn });
});

/* GET home page. */

module.exports = router;
