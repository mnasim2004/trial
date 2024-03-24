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
      const ObjectId = require('mongoose').Types.ObjectId;
      const userObjectId = new ObjectId(user);
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

    res.redirect(`/users/${userObjectId}`);
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
  router.get('/editp/:id', async function(req, res, next) {
    try {
        // Retrieve the product ID from the request parameters
        const productId = req.params.id;

        // Fetch the product details from the database based on the product ID
        const product = await Product.findById(productId);

        // Render the editp.hbs template and pass the product details to it
        res.render('editp.hbs', {  product: product });
    } catch (err) {
        // Handle errors
        next(err);
    }
});
router.post('/updatep/:id', upload.any(), async function(req, res, next) {
    try {
        let userId= req.session.user;

        const ObjectId = require('mongoose').Types.ObjectId;
        const userObjectId = new ObjectId(userId);

        const productId = req.params.id;
        var keys;

        // Check if there are any uploaded files
        if (req.files.length > 0) {
            // Upload new files to S3 and get the keys
            keys = await s3Upload(req.files);
        } else {
            // No new files uploaded, so use the existing keys
            // Retrieve the product to get the existing keys
            const product = await Product.findById(productId);
            keys = product.photoUrl;
        }
        // Fetch the product details from the request body
        const { brand, title, description, price, location } = req.body;

        // Update the product in the database
        await Product.findByIdAndUpdate(productId, {
            brand: brand,
            title: title,
            description: description,
            price: price,
            location: location,
            photoUrl: keys
        });
        console.log(userId);
        // Redirect the user to the profile page or any other appropriate page
        res.redirect(`/users/${userObjectId}`);
    } catch (err) {
        // Handle errors
        next(err);
    }
});

router.post('/delete/:id', async function(req, res, next) {
    try {
        // Retrieve the product ID from the request parameters
        let userId= req.session.user;

        const ObjectId = require('mongoose').Types.ObjectId;
        const userObjectId = new ObjectId(userId);
        const productId = req.params.id;

        // Delete the product from the database
        await Product.findByIdAndDelete(productId);

        // Redirect the user to a relevant page after successful deletion
        res.redirect(`/users/${userObjectId}`); // Redirect to the products page or any other appropriate page
    } catch (err) {
        // Handle errors
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
