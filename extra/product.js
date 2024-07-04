require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { s3Uploadv2, s3Uploadv3 } = require("../s3Service");
const uuid = require("uuid").v4;
var router = express.Router();

router.get("/addp", function (req, res, next) {
  res.render("product.hbs", { title: "Example" });
});
//single file upload
// const upload = multer({ dest: "uploads/" });
// app.post("/upload", upload.single("file"), (req, res) => {
//   res.json({ status: "success" });
// });

// multiple file uploads
// const upload = multer({ dest: "uploads/" });
// app.post("/upload", upload.array("file", 2), (req, res) => {
//   res.json({ status: "success" });
// });

// multiple fields upload
// const upload = multer({ dest: "uploads/" });

// const multiUpload = upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "resume", maxCount: 1 },
// ]);
// app.post("/upload", multiUpload, (req, res) => {
//   console.log(req.files);
//   res.json({ status: "success" });
// });

// custom filename

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${uuid()}-${originalname}`);
//   },
// });
//
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// ["image", "jpeg"]

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 2 },
});
// app.post("/upload", upload.array("file"), async (req, res) => {
//   try {
//     const results = await s3Uploadv2(req.files);
//     console.log(results);
//     return res.json({ status: "success" });
//   } catch (err) {
//     console.log(err);
//   }
// });

// router.post("/upload", upload.array("file"), async (req, res) => {
//   try {
//     const results = await s3Uploadv3(req.files);
//     console.log(results);
//     return res.json({ status: "success" });
//   } catch (err) {
//     console.log(err);
//   }
// });

router.post("/upload", upload.array("file"), async (req, res) => {
  try {
    const keys = await s3Uploadv2(req.files);
    console.log(keys[0]); // Log the array of generated keys

    //   const newProduct = new Product({
    //     username: req.body.username,
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: hashpassword,
    //     address: req.body.address,
    //     pincode: req.body.pincode,
    //     phoneNumber: req.body.phoneNumber
    // });

    // await newProduct.save();

    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image",
      });
    }
  }
});

module.exports = router;
