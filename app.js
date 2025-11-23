var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const dotenv = require("dotenv");
var session = require("express-session");
var { engine } = require("express-handlebars");
const exphbs = require("express-handlebars");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
const { db } = require("./db");
var app = express();
dotenv.config();

// Create partials directory if it doesn't exist
const fs = require("fs");
const partialsDir = path.join(__dirname, "views/partials");
if (!fs.existsSync(partialsDir)) {
  fs.mkdirSync(partialsDir, { recursive: true });
}

// Create Handlebars instance with helpers
const hbs = engine({
  extname: "hbs",
  defaultLayout: "layout",
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: partialsDir,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    // Helper to get image URL - handles both ImgBB (full URL) and S3 (needs prefix)
    imageUrl: function(imagePath) {
      if (!imagePath) return '';
      // If it's already a full URL (starts with http:// or https://), return as is (ImgBB)
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      // Otherwise, it's an S3 path, add the S3 prefix
      // Note: This assumes S3 bucket URL structure - adjust if needed
      const s3BaseUrl = process.env.S3_BASE_URL || 'https://trialmate.s3.amazonaws.com/';
      return s3BaseUrl + imagePath;
    },
    // Helper to check if user is logged in (alternative to checking session in template)
    isLoggedIn: function(loggedIn) {
      return loggedIn ? 'logged-in' : 'not-logged-in';
    },
    // Helper for equality check
    eq: function(a, b) {
      return a === b;
    },
    // Helper for conditional check (alternative to eq)
    ifCond: function(v1, v2, options) {
      if (v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    // Helper to format time
    formatTime: function(date) {
      if (!date) return '';
      const d = new Date(date);
      const now = new Date();
      const diff = now - d;
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return minutes + 'm ago';
      if (minutes < 1440) return Math.floor(minutes / 60) + 'h ago';
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  }
});

app.engine("hbs", hbs);

// view engine setup
// Set Handlebars as the view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
  secret: "Key", 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  } 
}));
//const { s3Uploadv2, s3Uploadv3 } = require("./s3Service");

db();

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/product", productRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message || 'Not Found';
  res.locals.error = {
    status: err.status || 404,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  };

  // render the error page
  res.status(err.status || 404);
  res.render('error');
});

// Note: Server is started by bin/www, not here
// Remove app.listen() to avoid conflicts

module.exports = app;
