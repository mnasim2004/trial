require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { s3Upload } = require("../s3Service");
const uuid = require("uuid").v4;
const Product = require("../model/product_model");

const router = express.Router();

const storage = multer.memoryStorage();


const upload = multer({
  storage
});




router.get('/addp', function(req, res, next) {
    res.render('product.hbs', { title: 'Example' });
  });



router.post("/upload", upload.any(), async (req, res) => {
    try {
      let user= req.session.user;
      var keys = await s3Upload(req.files);
      console.log(keys); 
      const newProduct = new Product({
        user: user,
        brand: req.body.brand,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,
        photoUrl: keys
    });

    await newProduct.save();

      return res.json({ status: "success" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });


router.get('/searchp', async function(req, res, next) {
    
    try {
        let userId= req.session.user; // Get the user ID to exclude from the query
        const { brand, price, location, user } = req.query;
        
        // Construct the MongoDB query based on the provided search criteria
        const query = {};
        if (brand) {
            query.brand = brand;
        }
        if (price) {
            query.price = price;
        }
        if (location) {
            query.location = location;
        }
        if (userId) {
            query.user = { $ne: userId }; // Add condition to exclude specific user ID
        }
        
        // Construct the MongoDB query to find all products excluding the specified user ID

        // Fetch all products from the database excluding the specified user ID
        const products = await Product.find(query);
        // Pass all products to the Handlebars template for rendering
        res.render('searchp.hbs',{products});
    } catch (err) {
        next(err);
    }
  });


  
// router.get('/searchr', async function(req, res, next) {
//     try {
//         let userId= req.session.user;
        
//         // Execute the MongoDB query to find matching products
//         const products = await Product.find(query);
//         return res.json({ status: "success" , products});
//         //res.render('search_results.hbs', { products, brand, price, location });
//     } catch (err) {
//         next(err);
//     }
//   });



module.exports = router;
